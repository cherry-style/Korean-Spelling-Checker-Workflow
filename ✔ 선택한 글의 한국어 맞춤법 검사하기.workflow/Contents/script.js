window.setTimeout(function () {
  // fix local links.
  var dontFollowLinks = document.querySelectorAll(
    'a[href="#"], a[href="#link"]'
  );
  [].forEach.call(dontFollowLinks, function (link) {
    link.removeAttribute("href");
  });

  var correctionWords = document.querySelectorAll("#divLeft1 font.ul");

  // fix malformed correction words
  var userInputElementsForCorrectionWord = document.querySelectorAll(
    "#divCorrectionTableBox1st .tdErrWord a"
  );
  var noOfWordsWeShouldBreakApart =
    userInputElementsForCorrectionWord.length - correctionWords.length;

  var targetElement,
    ID,
    counter = 0;
  while (noOfWordsWeShouldBreakApart > 0) {
    targetElement = document.querySelectorAll("#divLeft1 font.ul")[counter++];
    ID = targetElement.id.replace("ul_", "");
    checkWordBreakErrorsAndFixIt(targetElement, ID);
  }

  function checkWordBreakErrorsAndFixIt(target, ID) {
    var targetText = target.textContent.replace(/\n/g, "");
    var ID_Number = parseInt(ID, 10);
    var userInputText =
      userInputElementsForCorrectionWord[ID_Number].textContent;
    userInputText = userInputText.replace(/\n/g, "");
    if (targetText !== userInputText) {
      var HTMLToReplace = userInputText.concat(
        constructAndReturnWordBreakDelimiter(ID_Number)
      );
      target.parentElement.innerHTML = target.parentElement.innerHTML.replace(
        userInputText,
        HTMLToReplace
      );
      --noOfWordsWeShouldBreakApart;
    }
  }

  function constructAndReturnWordBreakDelimiter(ID_Number) {
    var userInputElement = userInputElementsForCorrectionWord[ID_Number],
      userInputErrorColor;
    switch (
      window.getComputedStyle(userInputElement).getPropertyValue("color")
    ) {
      case "rgb(255, 0, 0)":
        userInputErrorColor = "red";
        break;
      case "rgb(0, 0, 255)":
        userInputErrorColor = "blue";
        break;
      case "rgb(0, 128, 0)":
        userInputErrorColor = "green";
        break;
      case "rgb(128, 128, 0)":
        userInputErrorColor = "Olive";
        break;
      default:
        userInputErrorColor = "";
    }
    return (
      '</font><font id="ul_' +
      (ID_Number + 1) +
      '" color="' +
      userInputErrorColor +
      '" class="ul">'
    );
  }

  var scrollDiv = document.getElementById("divLeft1");

  // prepare tooltips and style the correction words
  correctionWords = document.querySelectorAll("#divLeft1 font.ul");
  [].forEach.call(correctionWords, function (word) {
    var ID = word.id.replace("ul_", "");
    var wordCandidates = [];
    var wordCandidateElements = document
      .querySelector("#tdReplaceWord_" + ID)
      .querySelectorAll("li:not(.liUserInputCandidate) a");
    [].forEach.call(wordCandidateElements, function (element) {
      wordCandidates.push(element.textContent);
    });
    word.dataset.kscWordCandidates = wordCandidates.join(";");
    word.tabIndex = 1; // make focusable using the tab key.
    word.addEventListener("mouseover", showCorrections, false);
    word.addEventListener("mouseout", hideTooltip, false);
    word.addEventListener("focus", showCorrections, false);
    word.addEventListener("blur", hideTooltip, false);
    word.addEventListener("click", swapWord, false);
    word.addEventListener("keydown", handleKeyDown, false);
    word.style.borderBottomColor = word.getAttribute("color");
    word.removeAttribute("onclick"); // remove defective click event

    markSpacingErrors(word, wordCandidates[0]);
  });

  function showCorrections(event) {
    var correctionID = event.target.id.replace("ul_", "");
    var correctionTable = document.querySelector("#tableErr_" + correctionID);
    correctionTable.style.backgroundColor = "#ffffcc";
    correctionTable.scrollIntoView();
    [].forEach.call(correctionWords, function (word) {
      word.style.backgroundColor = "inherit";
    });
    event.target.style.backgroundColor = "#ffdc00";
    showTooltip(event);
  }

  // inject tooltip span
  var tooltip = document.createElement("span");
  tooltip.setAttribute("id", "tooltip");
  document.getElementById("tableResult").appendChild(tooltip);

  // fill the tooltip content and display it
  function showTooltip(event) {
    var wordGotAttention = event.target;
    var wordCandidates = wordGotAttention.dataset.kscWordCandidates.split(";");
    if (wordCandidates[0] !== "") {
      updateTooltip(wordCandidates);
      tooltip.style.bottom =
        wordGotAttention.offsetParent.offsetHeight +
        scrollDiv.scrollTop -
        wordGotAttention.offsetTop +
        10 +
        "px";
      tooltip.style.left = wordGotAttention.offsetLeft + "px";
      tooltip.classList.add("is-shown");
    }
  }

  function updateTooltip(wordCandidates) {
    if (wordCandidates.length !== 0) {
      var firstCandidate = "&darr; " + wordCandidates.shift();
      wordCandidates.unshift(firstCandidate);
      tooltip.innerHTML = wordCandidates.reverse().join("<br>");
      tooltip.innerHTML = tooltip.innerHTML.replace(/…/g, "⋯");
    } else {
      hideTooltip(event);
    }
  }

  function hideTooltip(event) {
    var correctionID = event.target.id.replace("ul_", "");
    document.querySelector("#tableErr_" + correctionID).style.backgroundColor =
      "transparent";
    var tooltipClass = tooltip.classList;
    if (tooltipClass.contains("is-shown")) {
      tooltipClass.remove("is-shown");
    }
  }

  // swap animations
  var animationNames = [
    "bounce",
    "pulse",
    "swing",
    "tada",
    "bounceIn",
    "bounceInDown",
    "fadeInDown",
    "flipInX",
    "flipInY",
    "rotateIn",
    "rotateInDownLeft",
    "zoomIn",
    "zoomInDown",
  ];
  var animationName = animationNames[getRandomInt(0, animationNames.length)];

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function swapWord(event) {
    var wordGotAttention = event.target;
    var wordGotAttentionText = wordGotAttention.innerText;
    var wordCandidates = wordGotAttention.dataset.kscWordCandidates.split(";");
    var correctWord = wordCandidates.shift();
    if (correctWord !== "" && correctWord !== "대치어 없음") {
      wordGotAttention.innerHTML = "<span>" + correctWord + "</span>";
      wordGotAttention.childNodes[0].className = "animated " + animationName;
      wordGotAttention.dataset.kscWordCandidates = wordCandidates.join(";");
      wordGotAttention.classList.add("corrected");
      updateTooltip(wordCandidates);
      // correct duplicates of the wrong word at once
      [].forEach.call(correctionWords, function (word) {
        if (word.innerText === wordGotAttentionText && word !== event.target) {
          wordCandidates = word.dataset.kscWordCandidates.split(";");
          word.innerHTML = "<span>" + wordCandidates.shift() + "</span>";
          word.childNodes[0].className = "animated " + animationName;
          word.dataset.kscWordCandidates = wordCandidates.join(";");
          word.classList.add("corrected");
        }
      });

      var totalLength = document.getElementById("tdCorrection1stBox").innerText
        .length;

      var correctionTextLength = 0;

      var corrections = document.getElementsByClassName("correction");
      for (i = 0; i < corrections.length; i++) {
        var correction = corrections[i];
        correctionTextLength =
          correctionTextLength + corrections.innerText.length;
      }

      document.getElementById("tResultLTitle1").innerHTML =
        "[총 " + totalLength + "자]";
    } else {
      hideTooltip(event);
    }
    event.stopImmediatePropagation();
  }

  function handleKeyDown(event) {
    if (
      event.keycode === 13 ||
      event.keycode === 32 ||
      event.which === 13 ||
      event.which === 32
    ) {
      // enter or space
      event.target.click();
    }
  }

  function markSpacingErrors(word, candidate) {
    var wordText = word.innerText;
    if (hasSameOrderOfCharacters(wordText, candidate)) {
      var wordComponents = wordText.split(" "),
        candidateComponents = candidate.split(" "),
        wordCompsLength = wordComponents.length,
        candidateCompsLength = candidateComponents.length,
        textToReplace,
        noOfErrorsToFix;
      if (wordCompsLength > candidateCompsLength) {
        noOfErrorsToFix = wordCompsLength - candidateCompsLength;
        while (noOfErrorsToFix > 0) {
          textToReplace = wordComponents.pop();
          if (textToReplace !== candidateComponents.pop()) {
            // check if it's not spaced correctly
            wordText = wordText.replace(
              new RegExp(textToReplace + "$"),
              '<i class="tieError">' + textToReplace + "</i>"
            );
            --noOfErrorsToFix;
          } else {
            continue;
          }
        }
      } else {
        noOfErrorsToFix = candidateCompsLength - wordCompsLength;
        while (noOfErrorsToFix > 0) {
          textToReplace = candidateComponents.pop();
          if (textToReplace !== wordComponents.pop()) {
            wordText = wordText.replace(
              textToReplace,
              '<i class="spaceError">' + textToReplace + "</i>"
            );
            --noOfErrorsToFix;
          } else {
            continue;
          }
        }
      }
      word.innerHTML = wordText;
    }
  }

  function hasSameOrderOfCharacters(word1, word2) {
    return word1.split(" ").join("") === word2.split(" ").join("");
  }

  // select the proofread text to copy the content to clipboard before closing the window.
  var selectProofreadText = function () {
    window
      .getSelection()
      .selectAllChildren(document.getElementById("tdCorrection1stBox"));
  };
  document
    .getElementById("tableTail")
    .addEventListener("mouseover", selectProofreadText, false);

  var removeSelection = function () {
    window.getSelection().removeAllRanges();
  };
  document
    .getElementById("tdBody")
    .addEventListener("mouseenter", removeSelection, false);

  // if new updates available, show the notice.
  if (document.getElementById("ksc").dataset.updateStatus == "404") {
    var kscUpdateDiv = document.createElement("div");
    var kscUpdateLink = document.createElement("a");
    var kscUpdateLinkContent = document.createTextNode("새로운 버전!");
    kscUpdateLink.href = "https://appletree.or.kr/automator/";
    kscUpdateLink.title =
      "오른쪽 클릭 후 주소를 복사하고 웹 브라우저에서 새로운 버전을 내려받으세요!";
    kscUpdateLink.appendChild(kscUpdateLinkContent);
    kscUpdateDiv.appendChild(kscUpdateLink);
    kscUpdateDiv.id = "newVersion";
    document.getElementById("tdHead").appendChild(kscUpdateDiv);
    var kscSparkleDiv = document.createElement("div");
    kscSparkleDiv.id = "sparkleDiv";
    document.getElementById("tdHead").appendChild(kscSparkleDiv);
    document.getElementById("sparkleDiv").innerHTML =
      '<svg class="sparkle" width="90" height="90" viewBox="0 0 90 90"><g class="sparkle__group" opacity="0.8"><g class="sparkle__large"><path id="sparkle__large" d="M41.25,40 L42.5,10 L43.75,40 L45, 41.25 L75,42.5 L45,43.75 L43.75,45 L42.5,75 L41.25,45 L40,43.75 L10,42.5 L40,41.25z" fill="gold" /></g><g class="sparkle__large-2" transform="rotate(45)"><use xlink:href="#sparkle__large" /></g><g class="sparkle__small"><path id="sparkle__small" d="M41.25,40 L42.5,25 L43.75,40 L45,41.25 L60,42.5 L45,43.75 L43.75,45 L42.5,60 L41.25,45 L40,43.75 L25,42.5 L40,41.25z" fill="gold" /></g></g></svg>';
  }
}, 300);
