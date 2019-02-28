import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

const today = new Date();
const todayString = `${today.getDate()}-${today.getMonth() +
  1}-${today.getFullYear()}`;

function parseReservationTimesFromHtml(html) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(html, "text/html");

  return Array.from(doc.querySelectorAll("a.btn.btn-default.bottomsearch"))
    .filter(node => {
      return node.href.indexOf("cansegalar") > -1;
    })
    .map(node => {
      return node.innerHTML;
    });
}

function fetchReservationHtml() {
  const formData = new FormData();

  formData.append("language", "spanish");
  formData.append("restaurant", "goiko-cansegalar");
  formData.append("hour", "13:00");
  formData.append("date", todayString);
  formData.append("people", "8");

  return fetch(
    "https://www.covermanager.com/reservation/search_restaurant_groups_nobottom",
    {
      method: "POST",
      body: formData // body data type must match "Content-Type" header
    }
  ).then(response => response.json());
}

async function fetchAndSetReservationHtml() {
  const reservationResponse = await fetchReservationHtml();
  return parseReservationTimesFromHtml(reservationResponse.html_search);
}

function fetchGif(tag) {
  return fetch(
    `https://api.giphy.com/v1/gifs/random?api_key=RZAnLTeX9PwNoAMEy9nIl79GfxD4FhJi&tag=${tag}`
  )
    .then(response => response.json())
    .then(jsonResponse => {
      const gifUrl = jsonResponse.data.images.downsized_large.url;
      console.log(gifUrl);
      return gifUrl;
    });
}

function App() {
  const [reservationTimes, setReservationTimes] = useState(null);
  const [hasReservations, setHasReservations] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAndSetReservationHtml().then(reservationTimes => {
      setReservationTimes(reservationTimes);
      setHasReservations(reservationTimes.length > 0);
    });
  }, []);

  useEffect(
    () => {
      if (hasReservations == null) {
        return;
      }

      const imageTag = hasReservations ? "eat" : "sad";

      fetchGif(imageTag)
        .then(imageSrc => {
          setImageSrc(imageSrc);
        })
        .catch(err => {
          setImageSrc(hasReservations ? "img/eat.gif" : "img/sad.gif");
        });
    },
    [hasReservations]
  );

  if (error) {
    return <h1>ERROR</h1>;
  }

  return (
    <div className="App">
      <h1>goiko checker 🍔</h1>
      {Boolean(hasReservations != null) && (
        <section>
          <img src={imageSrc} className="status-image" />
        </section>
      )}
      <section className="reservation-time-list">
        {Boolean(reservationTimes) &&
          reservationTimes.map(reservationTime => (
            <article className="reservation-time-item" key={reservationTime}>
              {reservationTime}
            </article>
          ))}
      </section>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
