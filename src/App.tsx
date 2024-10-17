import "./App.css";
import React, { useEffect, useState } from "react";
import { useTimer } from "./hooks/useTimer";
import { usePollAppStatus } from "./hooks/usePollAppStatus";
import { CMD_COMMANDS } from "./constants/cmdCommands";

/* const { ipcRenderer } = window;

interface Recommendation {
  product: {
    ASIN: string;
    Title: string;
    URL: string;
  };
  message: string;
} */

function App() {
  const [totalMatchDuration, setTotalMatchDuration] = useState<string | null>(
    null
  );
  console.log(totalMatchDuration);
  // Timer hook for tracking match duration
  const { toggle, isActive, formatTime, reset /*getSeconds*/ } = useTimer();

  // Poll game status (running, not running)
  const { isAppRunning, wasAppRunning, message } = usePollAppStatus(
    CMD_COMMANDS.leagueOfLegendsGameClient,
    "League Of Legends"
  );

  useEffect(() => {
    // If game just started and timer isn't running, start the timer
    if (!isActive && isAppRunning) {
      toggle(); // Start timer
      setTotalMatchDuration(null); // Clear previous match duration
    }

    // If game just stopped and timer was running, stop the timer and save duration
    if (isActive && !isAppRunning && wasAppRunning) {
      setTotalMatchDuration(formatTime()); // Save the final match duration first
      setTimeout(() => {
        reset(); // Reset the timer after a brief delay to ensure state updates
      }, 0); // Allow the state to update before resetting the timer
    }
  }, [isAppRunning, wasAppRunning, isActive, toggle, formatTime, reset]);

  /* useEffect(() => {
    if (wasAppRunning && !isAppRunning) {
      // Game just ended
      ipcRenderer.send("game-ended");
    }
  }, [isAppRunning, wasAppRunning]);

  useEffect(() => {
    const handleGameEndProducts = (_event: any, products: any[]) => {
      // Handle the products received from the main process
      console.log("Received game end products:", products);
      // You can update your UI here to display the products
    };

    ipcRenderer.on("game-end-products", handleGameEndProducts);

    return () => {
      ipcRenderer.removeListener("game-end-products", handleGameEndProducts);
    };
  }, []);

  useEffect(() => {
    const handleGameEndRecommendations = (
      _event: any,
      recs: Recommendation[]
    ) => {
      // Handle the recommendations received from the main process
      console.log("Received game end recommendations:", recs);
      // You can update your UI here to display the recommendations
    };

    ipcRenderer.on("game-end-recommendations", handleGameEndRecommendations);

    return () => {
      ipcRenderer.removeListener(
        "game-end-recommendations",
        handleGameEndRecommendations
      );
    };
  }, []); */

  return (
    <>
      <div>
        <h1>Time Trade</h1>
        <h2>{message}</h2>

        <div className="card">
          {/* Waiting for match to start */}
          {totalMatchDuration && (
            <h3>
              Total match duration: {totalMatchDuration}. Waiting for a new
              match to start to track it.
            </h3>
          )}
          {!isAppRunning && !wasAppRunning && !totalMatchDuration && (
            <h3>Waiting on League match to start.</h3>
          )}

          {/* Match is in progress */}
          {isAppRunning && (
            <h3>
              League of Legends match is currently in progress. Current time:{" "}
              {formatTime()}
            </h3>
          )}

          {/* Match has ended, show match duration */}
        </div>

        {/* recommendations.length > 0 && (
          <div>
            <h3>Recommendations based on your last game:</h3>
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>
                  <p>{rec.message}</p>
                  <a
                    href={rec.product.URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {rec.product.Title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) */}
      </div>
    </>
  );
}

export default App;
