ace.define("ace/theme/tokyo_night",["require","exports","module","ace/lib/dom"],function(e,t,n){t.isDark=!0,t.cssClass="ace-tokyo-night",t.cssText=`.ace-tokyo-night .ace_gutter {
  background: #1a1b26;
  color: #565f89
}
.ace-tokyo-night .ace_print-margin {
  width: 1px;
  background: #565f89
}
.ace-tokyo-night {
  background-color: #1a1b26;
  color: #9aa5ce
}
.ace-tokyo-night .ace_cursor {
  color: #a9b1d6
}
.ace-tokyo-night .ace_marker-layer .ace_selection {
  background: #515c7e4d
}
.ace-tokyo-night.ace_multiselect .ace_selection.ace_start {
  box-shadow: 0 0 3px 0px #515c7e;
}
.ace-tokyo-night .ace_marker-layer .ace_step {
  background: #698cd6
}
.ace-tokyo-night .ace_marker-layer .ace_bracket {
  margin: -1px 0 0 -1px;
  border: 1px solid #698cd6
}
.ace-tokyo-night .ace_marker-layer .ace_active-line {
  background: #1f202e
}
.ace-tokyo-night .ace_gutter-active-line {
  background-color: #1f202e
}
.ace-tokyo-night .ace_marker-layer .ace_selected-word {
  border: 1px solid #698cd6
}
.ace-tokyo-night .ace_invisible {
  color: #52524d
}
.ace-tokyo-night .ace_entity.ace_name.ace_tag,
.ace-tokyo-night .ace_keyword,
.ace-tokyo-night .ace_meta.ace_tag,
.ace-tokyo-night .ace_storage {
  color: #f7768e
}
.ace-tokyo-night .ace_punctuation,
.ace-tokyo-night .ace_punctuation.ace_tag {
  color: #a9b1d6
}
.ace-tokyo-night .ace_constant.ace_character,
.ace-tokyo-night .ace_constant.ace_language,
.ace-tokyo-night .ace_constant.ace_numeric,
.ace-tokyo-night .ace_constant.ace_other {
  color: #ff9e64
}
.ace-tokyo-night .ace_invalid {
  color: #565f89;
  background-color: #f7768e
}
.ace-tokyo-night .ace_invalid.ace_deprecated {
  color: #565f89;
  background-color: #7dcfff
}
.ace-tokyo-night .ace_support.ace_constant,
.ace-tokyo-night .ace_support.ace_function {
  color: #bb9af7
}
.ace-tokyo-night .ace_fold {
  background-color: #73daca;
  border-color: #565f89
}
.ace-tokyo-night .ace_storage.ace_type,
.ace-tokyo-night .ace_support.ace_class,
.ace-tokyo-night .ace_support.ace_type {
  font-style: italic;
  color: #7aa2f7
}
.ace-tokyo-night .ace_entity.ace_name.ace_function,
.ace-tokyo-night .ace_entity.ace_other,
.ace-tokyo-night .ace_entity.ace_other.ace_attribute-name,
.ace-tokyo-night .ace_variable {
  color: #e0af68
}
.ace-tokyo-night .ace_variable.ace_parameter {
  font-style: italic;
  color: #bb9af7
}
.ace-tokyo-night .ace_string {
  color: #9ece6a
}
.ace-tokyo-night .ace_comment {
  color: #565f89
}
.ace-tokyo-night .ace_indent-guide {
  box-shadow: inset -1px 0 0 0 #565f89b3;
}`,t.$selectionColorConflict=!0;var r=e("../lib/dom");r.importCssString(t.cssText,t.cssClass,!1)});                (function() {
    ace.require(["ace/theme/tokyo_night"], function(m) {
        if (typeof module == "object" && typeof exports == "object" && module) {
            module.exports = m;
        }
    });
})();
