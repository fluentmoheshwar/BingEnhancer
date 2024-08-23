/*
Adapted from https://github.com/baturayp/Bingo
Author: Baturay Palas baturay_at_outlook.fr
*/

/*
Adapted from https://github.com/ajbdev/DuckDuckGoose
Author: Baturay Palas baturay_at_outlook.fr
*/

function update() {
  // creating the elements
  const ul = document.getElementsByTagName("ul")[0];
  const google = document.createElement("li");
  const brave = document.createElement("li");
  const mojeek = document.createElement("li");
  const searXNG = document.createElement("li");
  const input = document.getElementById("sb_form_q");

  // adding attributes to elements
  google.setAttribute("data-menuurl", "");
  brave.setAttribute("data-menuurl", "");
  mojeek.setAttribute("data-menuurl", "");

  // creating the link elements
  google.innerHTML = `<a target id="google">Google</a>`;
  brave.innerHTML = `<a target id="brave">Brave</a>`;
  mojeek.innerHTML = `<a target id="mojeek">Mojeek</a>`;
  searXNG.innerHTML = `<a target id="searXNG">searXNG</a>`;

  function updateURL() {
    const searchString = encodeURIComponent(input.value);
    document.getElementById(
      "google"
    ).href = `https://www.google.com/search?&q=${searchString}`;
    document.getElementById(
      "brave"
    ).href = `https://search.brave.com/search?q=${searchString}`;
    document.getElementById(
      "mojeek"
    ).href = `https://www.mojeek.com/search?q=${searchString}`;
    document.getElementById(
      "searXNG"
    ).href = `https://searx.namejeff.xyz/searx/search?q=${searchString}&language=all&safesearch=2&categories=general`;
  }

  if (input && input.value) {
    ul.appendChild(google);
    ul.appendChild(brave);
    ul.appendChild(mojeek);
    ul.appendChild(searXNG);
    input.onkeyup = updateURL;
    input.onblur = updateURL;
    updateURL();
  }
}

update();

chrome.runtime.onMessage.addListener(function (request) {
  if (request.message === "bingEnhancer") {
    update();
  }
});
