function update() {
  // creating the elements
  const ul = document.getElementsByTagName("ul")[0];
  const google = document.createElement("li");
  const brave = document.createElement("li");
  const mojeek = document.createElement("li");
  const searXNG = document.createElement("li");
  const wolframAlpha = document.createElement("li");
  const perplexity = document.createElement("li");
  const claude = document.createElement("li");
  const chatgpt = document.createElement("li");
  const baidu = document.createElement("li");
  const yandex = document.createElement("li");
  const input = document.getElementById("sb_form_q");

  // creating the link elements
  google.innerHTML = `<a target="_blank" id="google">Google</a>`;
  brave.innerHTML = `<a target="_blank" id="brave">Brave</a>`;
  mojeek.innerHTML = `<a target="_blank" id="mojeek">Mojeek</a>`;
  searXNG.innerHTML = `<a target="_blank" id="searXNG">searXNG</a>`;
  wolframAlpha.innerHTML = `<a target="_blank" id="wolframAlpha">Wolfram Alpha</a>`;
  perplexity.innerHTML = `<a target="_blank" id="perplexity">Perplexity</a>`;
  claude.innerHTML = `<a target="_blank" id="claude">Claude</a>`;
  chatgpt.innerHTML = `<a target="_blank" id="chatgpt">ChatGPT</a>`;
  baidu.innerHTML = `<a target="_blank" id="baidu">Baidu</a>`;
  yandex.innerHTML = `<a target="_blank" id="yandex">Yandex</a>`;

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
    document.getElementById(
      "perplexity"
    ).href = `https://www.perplexity.ai/search/new?q=${searchString}`;
    document.getElementById(
      "claude"
    ).href = `https://claude.ai/new?q=${searchString}`;
    document.getElementById(
      "chatgpt"
    ).href = `https://chatgpt.com/?q=${searchString}`;
    document.getElementById(
      "baidu"
    ).href = `https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=${searchString}&fenlei=256`;
    document.getElementById(
      "yandex"
    ).href = `https://yandex.com/search/?text=${searchString}`;
  }

  if (input && input.value) {
    ul.appendChild(google);
    ul.appendChild(brave);
    ul.appendChild(mojeek);
    ul.appendChild(searXNG);
    ul.appendChild(wolframAlpha);
    ul.appendChild(perplexity);
    ul.appendChild(claude);
    ul.appendChild(chatgpt);
    ul.appendChild(baidu);
    ul.appendChild(yandex);
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
