function update() {
  // creating the elements
  const ul = document.getElementsByTagName("ul")[0];
  const google = document.createElement("li");
  const brave = document.createElement("li");
  const mojeek = document.createElement("li");
  const searXNG = document.createElement("li");
  const wolframAlpha = document.createElement("li");
  const input = document.getElementById("sb_form_q");

  // creating the link elements
  google.innerHTML = `<a target="_blank" id="google">Google</a>`;
  brave.innerHTML = `<a target="_blank" id="brave">Brave</a>`;
  mojeek.innerHTML = `<a target="_blank" id="mojeek">Mojeek</a>`;
  searXNG.innerHTML = `<a target="_blank" id="searXNG">searXNG</a>`;
  wolframAlpha.innerHTML = `<a target="_blank" id="wolframAlpha">Wolfram Alpha</a>`;

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
    ).href = `https://searxng.world/search?q=${searchString}&language=auto&safesearch=2&categories=general`;
    document.getElementById(
      "wolframAlpha"
    ).href = `https://www.wolframalpha.com/input?i=${searchString}`;
  }

  if (input && input.value) {
    ul.appendChild(google);
    ul.appendChild(brave);
    ul.appendChild(mojeek);
    ul.appendChild(searXNG);
    ul.appendChild(wolframAlpha);
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
