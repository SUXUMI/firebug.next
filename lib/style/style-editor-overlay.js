/* See license.txt for terms of usage */

"use strict";

// Add-on SDK
const { Cu, Ci } = require("chrome");
const { loadSheet, removeSheet } = require("sdk/stylesheet/utils");
const { Class } = require("sdk/core/heritage");

// Firebug SDK
const { Trace, TraceError } = require("firebug.sdk/lib/core/trace.js").get(module.id);
const { devtools, ToolSidebar } = require("firebug.sdk/lib/core/devtools.js");
const { PanelOverlay } = require("firebug.sdk/lib/panel-overlay.js");
const { Xul } = require("firebug.sdk/lib/core/xul.js");
const { PanelToolbar } = require("firebug.sdk/lib/panel-toolbar.js");
const { ToolbarButton } = require("firebug.sdk/lib/toolbar-button.js");

// Firebug
const { MediaPanel } = require("./media-panel.js");
const { ToggleSideBarButton } = require("../chrome/toggle-sidebar-button.js");
const { Theme } = require("../chrome/theme.js");

// Platform
const { Services } = Cu.import("resource://gre/modules/Services.jsm", {});

// Constants
const PREF_MEDIA_SIDEBAR = "devtools.styleeditor.showMediaSidebar";
const PREF_ORIG_SOURCES = "devtools.styleeditor.source-maps-enabled";

const { BOX, SPLITTER, TABBOX, TABS, TABPANELS } = Xul;

/**
 * @overlay This object represents an overlay that is responsible
 * for customizing the 'Style Editor' panel.
 *
 * Some info about the native structure of the Style Editor panel:
 *
 * this.panel => {@StyleEditorPanel}
 * this.panel.UI => {@StyleEditorUI}
 * this.panel.UI.editors => *{@StyleSheetEditor}
*/
const StyleEditorOverlay = Class(
/** @lends StyleEditorOverlay */
{
  extends: PanelOverlay,

  overlayId: "styleeditor",

  // Side Panels

  getSidePanels: function() {
    return [MediaPanel];
  },

  // Theme

  onApplyTheme: function(win, oldTheme) {
    PanelOverlay.prototype.onApplyTheme.apply(this, arguments);

    Trace.sysout("StyleEditorOverlay.onApplyTheme; " + win.location.href);

    loadSheet(win, "chrome://firebug/skin/style-editor.css", "author");

    let doc = win.document;

    // Create panel toolbar and populate it with buttons.
    if (!this.mainToolbar) {
      let details = doc.querySelector(".splitview-side-details");
      this.mainToolbar = new PanelToolbar({
        parentNode: details,
        insertBefore: details.firstChild,
      });

      // Get panel toolbar buttons
      let items = this.getPanelToolbarButtons();
      if (items) {
        this.mainToolbar.createItems(items);
      }

      let splitter =
        SPLITTER({"id": "panelSplitter", "valign": "top",
          "orient": "horizontal", "class": "devtools-side-splitter"},
          BOX({"class": "panelSplitterBox"})
        );

      let tabbox =
        TABBOX({"id": "panelSideBox", "class": "devtools-sidebar-tabs",
          "handleCtrlTab": "false"},
            TABS(),
            TABPANELS({"flex": "1"})
        );

      let parentNode = doc.querySelector(".splitview-root");
      this.splitter = splitter.build(parentNode);
      this.tabbox = tabbox.build(parentNode);

      // Create side bar, the Style Editor panel doesn't have its own.
      // xxxHonza: as soon as there is a default side bar this part
      // must be adopted TESTME
      this.sidebar = new ToolSidebar(this.tabbox, this, this.overlayId);
      this.sidebarOverlay.sidebar = this.sidebar;

      this.setupSidePanels();

      this.toggleSideBar = new ToggleSideBarButton({
        panel: this,
        toolbar: this.mainToolbar.toolbar,
      });
    }

    Theme.customizeSideBarSplitter(win, true);
  },

  onUnapplyTheme: function(win, newTheme) {
    PanelOverlay.prototype.onUnapplyTheme.apply(this, arguments);

    Trace.sysout("StyleEditorOverlay.onUnapplyTheme; " + win.location.href);

    removeSheet(win, "chrome://firebug/skin/style-editor.css", "author");

    if (!this.mainToolbar) {
      return;
    }

    this.sidebarOverlay.removeSidePanels();

    this.toggleSideBar.destroy();
    this.mainToolbar.remove();
    this.splitter.remove();
    this.tabbox.remove();

    // xxxHonza: Executing destroy causes an exception
    // TypeError: this._tabbox.tabpanels is undefined
    // this.sidebar.destroy();

    this.sidebar = null;
    this.mainToolbar = null;

    Theme.customizeSideBarSplitter(win, false);
  },

  // Toolbar Buttons

  getPanelToolbarButtons: function() {
    let buttons = [];
    return buttons;
  },

  // Options

  getOptionsMenuItems: function() {
    let items = [];

    items.push({
      id: "options-origsources",
      type: "checkbox",
      checked: Services.prefs.getBoolPref(PREF_ORIG_SOURCES),
      label: "showOriginalSources.label",
      accesskey: "showOriginalSources.accesskey",
      command: this.panel.UI._toggleOrigSources
    });

    return items;
  },
});

// Exports from this module
exports.StyleEditorOverlay = StyleEditorOverlay;
