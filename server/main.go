package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/paapi5"
	"math/rand"
)

// AmazonAPI represents the Amazon API client
type AmazonAPI struct {
	AccessKey string
	SecretKey string
	AssociateTag string
	Region string
	Client *paapi5.ProductAdvertisingAPIv1
}

// Product represents a simplified Amazon product
type Product struct {
	ASIN  string `json:"asin"`
	Title string `json:"title"`
	URL   string `json:"url"`
}

type ProductRecommendation struct {
	Product  Product `json:"product"`
	Message  string  `json:"message"`
}

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Initialize Amazon API client
	amazonAPI := &AmazonAPI{
		AccessKey: os.Getenv("AMAZON_ACCESS_KEY"),
		SecretKey: os.Getenv("AMAZON_SECRET_KEY"),
		AssociateTag: os.Getenv("AMAZON_ASSOCIATE_TAG"),
		Region: os.Getenv("AMAZON_REGION"),
	}

	// Initialize AWS session
	sess, err := session.NewSession(&aws.Config{
		Region:      aws.String(amazonAPI.Region),
		Credentials: credentials.NewStaticCredentials(amazonAPI.AccessKey, amazonAPI.SecretKey, ""),
	})
	if err != nil {
		log.Fatal("Error creating AWS session:", err)
	}

	// Create PA-API client
	amazonAPI.Client = paapi5.New(sess)

	// Set up HTTP routes
	http.HandleFunc("/products", func(w http.ResponseWriter, r *http.Request) {
		handleProductSearch(w, r, amazonAPI)
	})

	// Start the server
	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleProductSearch(w http.ResponseWriter, r *http.Request, api *AmazonAPI) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	keyword := r.URL.Query().Get("keyword")
	if keyword == "" {
		http.Error(w, "Keyword is required", http.StatusBadRequest)
		return
	}

	durationStr := r.URL.Query().Get("duration")
	duration, err := time.ParseDuration(durationStr)
	if err != nil {
		http.Error(w, "Invalid duration format", http.StatusBadRequest)
		return
	}

	products, err := searchProducts(api, keyword)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	recommendations := generateRecommendations(products, duration)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recommendations)
}

func generateRecommendations(products []Product, duration time.Duration) []ProductRecommendation {
	var recommendations []ProductRecommendation

	for _, product := range products {
		message := generateMessage(product, duration)
		recommendation := ProductRecommendation{
			Product: product,
			Message: message,
		}
		recommendations = append(recommendations, recommendation)
	}

	return recommendations
}

func generateMessage(product Product, duration time.Duration) string {
	minutes := int(duration.Minutes())
	
	messages := []string{
		fmt.Sprintf("Instead of playing for %d minutes, you could've read %d pages of %s", minutes, minutes/2, product.Title),
		fmt.Sprintf("In the %d minutes you spent gaming, you could have learned a new skill with %s", minutes, product.Title),
		fmt.Sprintf("%d minutes of gameplay time could have been %d minutes of productive time with %s", minutes, minutes, product.Title),
		fmt.Sprintf("Transform your %d minutes of gaming into personal growth with %s", minutes, product.Title),
	}

	return messages[rand.Intn(len(messages))]
}

func searchProducts(api *AmazonAPI, keyword string) ([]Product, error) {
	input := &paapi5.SearchItemsInput{
		Keywords:    aws.String(keyword),
		PartnerTag:  aws.String(api.AssociateTag),
		PartnerType: aws.String("Associates"),
		Marketplace: aws.String("www.amazon.com"),
		Resources: []*string{
			aws.String("ItemInfo.Title"),
			aws.String("Offers.Listings.Price"),
			aws.String("Images.Primary.Medium"),
		},
	}

	result, err := api.Client.SearchItems(input)
	if err != nil {
		return nil, fmt.Errorf("error searching items: %v", err)
	}

	var products []Product
	for _, item := range result.SearchResult.Items {
		product := Product{
			ASIN:  aws.StringValue(item.ASIN),
			Title: aws.StringValue(item.ItemInfo.Title.DisplayValue),
			URL:   aws.StringValue(item.DetailPageURL),
		}
		products = append(products, product)
	}

	return products, nil
}
