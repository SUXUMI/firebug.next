/* See license.txt for terms of usage */

"use strict";

const { Cu } = require("chrome");
const { getMostRecentBrowserWindow } = require("sdk/window/utils");
const { openTab, getBrowserForTab, closeTab } = require("sdk/tabs/utils");
const { openToolbox } = require("dev/utils");
const { Trace, TraceError } = require("../lib/core/trace.js").get(module.id);

// Import 'devtools' object
Cu.import("resource://gre/modules/devtools/Loader.jsm");

exports["test Command Editor"] = function(assert, done) {
  // TODO put the logic in a util file.
  let sidePanelId = "commandEditor";
  let promise = new Promise((resolve) => {
    openToolbox("webconsole").then((toolbox) => {
      let panel = toolbox.getCurrentPanel()._firebugPanelOverlay;
      panel.toggleSidebar();
      console.log("step 1");
      panel.once("show", () => {
        console.log("step 2");
        let sidebar = panel._firebugPanelOverlay.sidebar;
        sidebar.select(sidePanelId);
        resolve(sidebar.getTab(sidePanelId));
      });
    });
  });

  promise.then((sidePanel) => {
    console.log("step 3");
    let iframe = sidePanel.querySelector(".iframe-commandEditor");
    let editorWin = XPCNativeWrapper.unwrap(iframe.contentWindow);
    let { editor } = editorWin;
  });
  // Open a new browser tab.
  // xxxHonza: use proper test page URL FIX ME
  var panelId = "";
  /*
  // Wait till the tab is loaded.
  // xxxHonza: there is a lot of logs in the console:
  // Bug 1022658 - Heavy logging in the console slows down unit test execution
  var tabBrowser = getBrowserForTab(newTab);
  function onPageLoad() {
    tabBrowser.removeEventListener("load", onPageLoad, true);

    var panelId = "dev-panel-firebug-nextgetfirebug-com-DOM";
    var tool = browser.gDevTools.getToolDefinition(panelId);
    assert.ok(tool, "The DOM tool must exist!");

    // Get debugging target for the new tab.
    let target = devtools.TargetFactory.forTab(newTab);

    // Open toolbox with the Hello World panel selected
    browser.gDevTools.showToolbox(target, panelId).then(function(toolbox) {
      var panel = toolbox.getCurrentPanel();

      assert.ok(panel.id == panelId, "DOM panel is loaded!");

      closeTab(newTab);
      done();
    }).then(null, console.error);
  }

  tabBrowser.addEventListener("load", onPageLoad, true);*/
};

function selectSidePanel(sidePanelId, panelId, tab, browser) {
}

/*
function selectPanel(panelId, tab, browser) {
  if (!browser) {
    browser = getMostRecentBrowserWindow();
  }
  let target = targetFor(tab);
  let toolbox = 
}*/

require("sdk/test").run(exports);
