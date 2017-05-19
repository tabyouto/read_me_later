(function(window){var svgSprite="<svg>"+""+'<symbol id="icon-chidouren-copy" viewBox="0 0 1024 1024">'+""+'<path d="M921.69 243.052c-88.023-120.427-229.847-191.698-381.027-191.698-259.040 0-469.045 205.774-469.045 459.362 0 253.814 210.004 459.584 469.045 459.584 146.388 0 284.568-67.027 373.271-181.201l-373.271-278.383 381.027-267.665zM618.394 191.769c33.74 0 61.084 26.798 61.084 59.853 0 33.057-27.344 59.854-61.084 59.854-33.734 0-61.088-26.798-61.088-59.854 0-33.054 27.354-59.853 61.088-59.853z"  ></path>'+""+"</symbol>"+""+'<symbol id="icon-delete" viewBox="0 0 1024 1024">'+""+'<path d="M809.984 169.984l0 86.016-596.010667 0 0-86.016 148.010667 0 43.989333-41.984 212.010667 0 43.989333 41.984 148.010667 0zM256 809.984l0-512 512 0 0 512c0 45.994667-40.021333 86.016-86.016 86.016l-340.010667 0c-45.994667 0-86.016-40.021333-86.016-86.016z"  ></path>'+""+"</symbol>"+""+'<symbol id="icon-bookmark" viewBox="0 0 1024 1024">'+""+'<path d="M128.343623 0.495474h767.184797a127.864133 127.864133 0 0 1 127.864132 127.864132v767.184797a127.864133 127.864133 0 0 1-127.864132 127.864132h-767.184797a127.864133 127.864133 0 0 1-127.864133-127.864132v-767.184797a127.864133 127.864133 0 0 1 127.864133-127.864132z" fill="#EFF1F1" ></path>'+""+'<path d="M128.343623 96.393573h767.184797a127.864133 127.864133 0 0 1 127.864132 127.864133v671.286697a127.864133 127.864133 0 0 1-127.864132 127.864132h-767.184797a127.864133 127.864133 0 0 1-127.864133-127.864132v-671.286697a127.864133 127.864133 0 0 1 127.864133-127.864133z" fill="#EFF1F1" ></path>'+""+'<path d="M128.343623 192.291673h767.184797a127.864133 127.864133 0 0 1 127.864132 127.864132v575.388598a127.864133 127.864133 0 0 1-127.864132 127.864132h-767.184797a127.864133 127.864133 0 0 1-127.864133-127.864132v-575.388598a127.864133 127.864133 0 0 1 127.864133-127.864132z" fill="#EFF1F1" ></path>'+""+'<path d="M895.52842 0.495474h-767.184797a127.864133 127.864133 0 0 0-127.864133 127.864132v31.966033a127.864133 127.864133 0 0 1 127.864133-127.864132h767.184797a127.864133 127.864133 0 0 1 127.864132 127.864132v-31.966033a127.864133 127.864133 0 0 0-127.864132-127.864132z" fill="#D7D8D8" ></path>'+""+'<path d="M895.52842 96.393573h-767.184797a127.864133 127.864133 0 0 0-127.864133 127.864133v31.966033a127.864133 127.864133 0 0 1 127.864133-127.864133h767.184797a127.864133 127.864133 0 0 1 127.864132 127.864133v-31.966033a127.864133 127.864133 0 0 0-127.864132-127.864133z" fill="#D7D8D8" ></path>'+""+'<path d="M895.52842 192.291673h-767.184797a127.864133 127.864133 0 0 0-127.864133 127.864132v31.966034a127.864133 127.864133 0 0 1 127.864133-127.864133h767.184797a127.864133 127.864133 0 0 1 127.864132 127.864133v-31.966034a127.864133 127.864133 0 0 0-127.864132-127.864132z" fill="#D7D8D8" ></path>'+""+'<path d="M256.207756 96.393573h511.456531v767.216763l-255.632367-159.862132-255.824164 159.862132V96.393573z" fill="#E2574C" ></path>'+""+'<path d="M256.207756 96.393573h511.456531v127.864133h-511.456531z" fill="#B5463D" ></path>'+""+"</symbol>"+""+"</svg>";var script=function(){var scripts=document.getElementsByTagName("script");return scripts[scripts.length-1]}();var shouldInjectCss=script.getAttribute("data-injectcss");var ready=function(fn){if(document.addEventListener){if(~["complete","loaded","interactive"].indexOf(document.readyState)){setTimeout(fn,0)}else{var loadFn=function(){document.removeEventListener("DOMContentLoaded",loadFn,false);fn()};document.addEventListener("DOMContentLoaded",loadFn,false)}}else if(document.attachEvent){IEContentLoaded(window,fn)}function IEContentLoaded(w,fn){var d=w.document,done=false,init=function(){if(!done){done=true;fn()}};var polling=function(){try{d.documentElement.doScroll("left")}catch(e){setTimeout(polling,50);return}init()};polling();d.onreadystatechange=function(){if(d.readyState=="complete"){d.onreadystatechange=null;init()}}}};var before=function(el,target){target.parentNode.insertBefore(el,target)};var prepend=function(el,target){if(target.firstChild){before(el,target.firstChild)}else{target.appendChild(el)}};function appendSvg(){var div,svg;div=document.createElement("div");div.innerHTML=svgSprite;svgSprite=null;svg=div.getElementsByTagName("svg")[0];if(svg){svg.setAttribute("aria-hidden","true");svg.style.position="absolute";svg.style.width=0;svg.style.height=0;svg.style.overflow="hidden";prepend(svg,document.body)}}if(shouldInjectCss&&!window.__iconfont__svg__cssinject__){window.__iconfont__svg__cssinject__=true;try{document.write("<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>")}catch(e){console&&console.log(e)}}ready(appendSvg)})(window)