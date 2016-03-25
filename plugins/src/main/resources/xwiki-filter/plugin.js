/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

/**
 * The following transformations (specific to the XWiki Rendering) are performed:
 *
 * <ul>
 *   <li>converts empty lines to empty paragraphs and back</li>
 * </ul>
 *
 * @see http://docs.cksource.com/CKEditor_3.x/Developers_Guide/Data_Processor
 */
(function() {
  'use strict';
  CKEDITOR.plugins.add('xwiki-filter', {
    init : function(editor) {
      var replaceEmptyLinesWithEmptyParagraphs = {
        elements: {
          div: function(element) {
            if (element.attributes['class'] === 'wikimodel-emptyline') {
              element.name = 'p';
              delete element.attributes['class'];
              // Skip the subsequent rules as we changed the element name.
              return element;
            }
          }
        }
      };

      var replaceEmptyParagraphsWithEmptyLines = {
        elements: {
          p: function(element) {
            if (isEmptyParagraph(element)) {
              element.name = 'div';
              element.attributes['class'] = 'wikimodel-emptyline';
              // Skip the subsequent rules as we changed the element name.
              return element;
            }
          },
          // We need a separate rule to clean the empty line after the block filter rule adds the space char.
          div: function(element) {
            if (element.attributes['class'] === 'wikimodel-emptyline') {
              while (element.children.length > 0) {
                element.children[0].remove();
              }
            }
          }
        }
      };

      var isEmptyParagraph = function(paragraph) {
        var children = paragraph.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          // Ignore the BR element if it's the last child.
          if ((child.type === CKEDITOR.NODE_ELEMENT && !(child.name === 'br' && i === children.length - 1)) ||
              // Ignore white-space in text nodes. It seems the text node value is HTML encoded..
              (child.type === CKEDITOR.NODE_TEXT && CKEDITOR.tools.htmlDecode(child.value).trim() !== '')) {
            return false;
          }
        }
        return true;
      };

      // Filter the editor input.
      var dataFilter = editor.dataProcessor && editor.dataProcessor.dataFilter;
      if (dataFilter) {
        dataFilter.addRules(replaceEmptyLinesWithEmptyParagraphs, {priority: 5});
      }

      // Filter the editor output.
      var htmlFilter = editor.dataProcessor && editor.dataProcessor.htmlFilter;
      if (htmlFilter) {
        htmlFilter.addRules(replaceEmptyParagraphsWithEmptyLines, {priority: 14, applyToAll: true});
      }
    }
  });
})();