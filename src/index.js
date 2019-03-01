import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import StatusGif from "./StatusGif/StatusGif";

import "./styles.css";
import "./styles/fadeIn.css";

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
      const gifUrlPaceholder =
        jsonResponse.data.images.fixed_width_small_still.url;
      console.log(gifUrl);
      return { gifUrl, gifUrlPaceholder };
    });
}

const RESERVATIONS_SECOND_ROW_THRESHOLD = 9;
const RESERVATIONS_THIRD_ROW_THRESHOLD = 13;
function imageSizeClassNameToFit(reservationTimesCount) {
  if (reservationTimesCount === 0) {
    return;
  }

  if (reservationTimesCount < RESERVATIONS_SECOND_ROW_THRESHOLD) {
    return "medium";
  }

  if (reservationTimesCount < RESERVATIONS_THIRD_ROW_THRESHOLD) {
    return "small";
  }

  return;
}

function App() {
  const [reservationTimes, setReservationTimes] = useState(null);
  const [hasReservations, setHasReservations] = useState(null);
  const [statusGifSrc, setStatusGifSrc] = useState(null);
  const [statusGifPlaceholderSrc, setStatusGifPlaceholderSrc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAndSetReservationHtml().then(reservationTimes => {
      setReservationTimes(reservationTimes);
      setHasReservations(reservationTimes.length > 0);
    });
  }, []);

  useEffect(() => {
    if (hasReservations == null) {
      return;
    }

    const imageTag = hasReservations ? "eat" : "sad";

    fetchGif(imageTag)
      .then(
        ({
          gifUrl: statusGifSrc,
          gifUrlPaceholder: statusGifPlaceholderSrc
        }) => {
          setStatusGifSrc(statusGifSrc);
          setStatusGifPlaceholderSrc(statusGifPlaceholderSrc);
        }
      )
      .catch(err => {
        setStatusGifSrc(hasReservations ? "img/eat.gif" : "img/sad.gif");
      });
  }, [hasReservations]);

  if (error) {
    return <h1>ERROR</h1>;
  }

  return (
    <div className="App">
      <h1>goiko checker 🍔</h1>
      {Boolean(hasReservations != null) && (
        <section>
          <StatusGif
            src={statusGifSrc}
            placeholderSrc={statusGifPlaceholderSrc}
            size={imageSizeClassNameToFit(reservationTimes.length)}
          />
        </section>
      )}
      {Boolean(hasReservations) && (
        <section className="reservation-time__list fade-in">
          {reservationTimes.map(reservationTime => (
            <article className="reservation-time__item" key={reservationTime}>
              {reservationTime}
            </article>
          ))}
        </section>
      )}
      {Boolean(hasReservations === false) && (
        <section className="no-reservations fade-in">
          Hoy te toca <span>SaladMarket 🥗</span>
        </section>
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
