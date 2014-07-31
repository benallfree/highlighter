// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.

function Hilitor(tag)
{
  var hiliteTag = tag || "EM";
  var skipTags = new RegExp("^(?:SCRIPT)$");
  var colors = ["#ff6", "#a0ffff", "#9f9", "#f99", "#f6f"];
  var wordColor = [];
  var colorIdx = 0;
  var matchRegex = "";
  var openLeft = false;
  var openRight = false;
  var matchedKeywords = [];
  var ignoreClasses = null;
  this.foundMatch = false;

  this.setMatchType = function(type)
  {
    switch(type)
    {
      case "left":
        this.openLeft = false;
        this.openRight = true;
        break;
      case "right":
        this.openLeft = true;
        this.openRight = false;
        break;
      case "open":
        this.openLeft = this.openRight = true;
        break;
      default:
        this.openLeft = this.openRight = false;
    }
  };

  this.setRegex = function(input)
  {
    input = input.replace(/^[^\w]+|[^\w]+$/g, "");
    //input = input.replace(/[^$]+/g, "|");
    var re = "(" + input + ")";
    if(!this.openLeft) re = "\\b" + re;
    if(!this.openRight) re = re + "\\b";
    matchRegex = new RegExp(re, "i");
  };

  this.getRegex = function()
  {
    var retval = matchRegex.toString();
    retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, "");
    retval = retval.replace(/\|/g, " ");
    return retval;
  };

  this.isNodeAllowed = function(node) {
    if (node && typeof node.className === "string") {
      var nodeClasses = node.className;
      for (var i=0; i<ignoreClasses.length; i++) {
        if (nodeClasses.indexOf(ignoreClasses[i]) > -1) {
          return false;
        }
      }
    }
    else {
      return true;
    }

    return true;
  };

  // recursively apply word highlighting
  this.hiliteWords = function(node)
  {
    if(node == undefined || !node) return;
    if(!matchRegex) return;
    if(skipTags.test(node.nodeName)) return;

    if(node.hasChildNodes()) {
      for(var i=0; i < node.childNodes.length; i++)
        if (this.isNodeAllowed(node.childNodes[i])) {
          this.hiliteWords(node.childNodes[i]);
        }
    }
    if(node.nodeType == 3) { // NODE_TEXT and not in ignore list
      if((nv = node.nodeValue) && (regs = matchRegex.exec(nv))) {
        if(!wordColor[regs[0].toLowerCase()]) {
          wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
        }

        // don't increment keyword count if it's a truncated text because a full text also exists for the truncated text, 
        // so we don't want it to be counted twice
        if (node.parentNode.className.indexOf("jsTruncated") === -1) {
          this.foundMatch = true;

          var matchedKeyword = regs[0], 
            matchedKeywordLowerCase = matchedKeyword.toLowerCase();

          for (var i=0; i<matchedKeywords.length; i++) {
            var obj = matchedKeywords[i];
            if (obj.keyword.toLowerCase() == matchedKeywordLowerCase) {
              obj.keyword = matchedKeyword;
              obj.count++;
              break;
            }
          }
        }

        var match = document.createElement(hiliteTag);
        match.appendChild(document.createTextNode(regs[0]));
        match.style.backgroundColor = wordColor[regs[0].toLowerCase()];
        match.style.fontStyle = "inherit";
        match.style.color = "#000";
        match.className = 'hilitor';

        var skillNames = highlighter.getMatchingSkillsNames(regs[0]);
        match.title = Utils.quoteAttr(skillNames);

        var after = node.splitText(regs.index);
        after.nodeValue = after.nodeValue.substring(regs[0].length);
        node.parentNode.insertBefore(match, after);
      }
    };
  };

  // remove highlighting
  this.remove = function()
  {
    matchedKeywords = [];
    var arr = document.getElementsByTagName(hiliteTag);
    while(arr.length && (el = arr[0])) {
      var parent = el.parentNode;
      parent.replaceChild(el.firstChild, el);
      parent.normalize();
    }
  };

  // start highlighting at target node
  this.apply = function(elems, input, removeExisting, ignClasses)
  {
    if(input == undefined || !input || input.length <= 0) return;

    if (typeof elems.length == "undefined") {
      elems = [elems];
    }

    if (removeExisting) {
      this.remove();

      for (var i=0; i<input.length; i++) {
        matchedKeywords.push({
          keyword: input[i], 
          count: 0
        });
      }
    }

    input = input.join("|")

    this.setRegex(input);

    ignoreClasses = ['hilitor'];
    if (ignClasses) {
      Array.prototype.push.call(ignoreClasses, ignClasses);
    }

    for (var i=0; i<elems.length; i++) {
      this.hiliteWords(elems[i]);
    }

    var matchedKeywordsFiltered = matchedKeywords.filter(function(keyword) {
      return keyword.count > 0;
    });

    matchedKeywordsFiltered = matchedKeywordsFiltered.sort(function(keywordA, keywordB) {
      var result = keywordB.count - keywordA.count;
      if (result == 0) {
        return keywordA.keyword > keywordB.keyword ? 1 : (keywordA.keyword < keywordB.keyword ? -1 : 0);
      }
      return result;
    });

    return matchedKeywordsFiltered;
  };
}
