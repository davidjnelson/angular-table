Angular Table
=============

Quick Start
-----------

* include angular.js, angular-table.js, and angular-table.css.
* Put this in your template: 

```html

<angular-table model="[ { id: 1, name: 'Bob', street: '1 street ave' } ]" default-sort-column="id">
    <header-row>
        <header-column sortable="true" sort-field-name="id">
            <div style="display: inline-block;">Id</div>
            <sort-arrow-ascending></sort-arrow-ascending>
            <sort-arrow-descending></sort-arrow-descending>
        </header-column>
        <header-column sortable="false" sort-field-name="name" class="demoHeaderColumn">
            Name
        </header-column>
        <header-column sortable="true" sort-field-name="street" class="demoFarRightHeaderColumn">
            <div style="display: inline-block;">Street</div>
            <sort-arrow-ascending></sort-arrow-ascending>
            <sort-arrow-descending></sort-arrow-descending>
        </header-column>
    </header-row>

    <row on-selected="handleRowSelection(row)" selected-color="#87cefa" even-color="#ffffff" 
        odd-color="#eeeeee">
        <column>{{ row.id }}</column>
        <column>{{ row.name }}</column>
        <column class="demoFarRightColumn">{{ row.street }}</input></column>
    </row>
</angular-table>

```

An angular directive for a table with fixed, sortable headers, row selection, row even/odd coloring, 
which automatically stays the correct height relative to its container when the browser is resized. 
No javascript code required; the api is a 100% declarative dsl. 

Live Demo:
----------

* Angular Table Demo
* Angular Table Demo with ugly data, showing how you can abuse the css you pass in, but still have a functional grid.

Philosophy:
-----------

Start with a solid foundation of an easy to use api, provided as a custom html tag, also known as a 
domain specific language.  Only implement features with use cases in apps being pushed to production.  Keep the
code clean, lean, and blazing fast.

Features:
---------

* 100% declerative dsl - no javascript required
* fixed headers
* sortable headers
* sorting tracks the state of ascending / descending on a per column basis
* extremely easy to customize, just add your own html and css to the custom html tags.  it just works!
* simple row selection.  just pass the name of a method on your controller scope, and the row will be passed in.
* row even/odd coloring
* rows are bound to a model, which is simply an array of your objects, allowing for simple customization 
and data loading
* enable / disable sorting of columns
* when the browser is resized or data is added / removed from the bound model, as scrollbars appear / disappear 
the fixed header columns adjust their width to pixel perfection.
* when the browser is resized or data is added / removed from the bound model, the height of the scrolling
container adjusts its height to pixel perfection, even if your container's height is specified in percentages.
* does not require any dependencies other than stock angular.  no jquery needed.
* simple.  only 400 lines of code.

Styling the ascending / descending icons:
-----------------------------------------

This is the one part of the api I'm still not thrilled about.  I may update this in the near future.  I wanted to have 
a nice looking out of the box style, with the ability to fully customize the icons as well.

* To use the default functionality, ensure your header text is in an element with the style:  display: inline-block applied
so that the icon and your header text aligns.
* To change the style, remove or change the classes 'angularTableDefaultSortArrowAscending' and
'angularTableDefaultSortArrowDescending' in angular-table.css.  Of course, you can add any css classes, style attributes, and
the html inside both the sort arrow tags, as you can with any of the other custom tags.

Why Not Use ng-grid or smart table?
-----------------------------------

While I deeply respect the work these folks have done, there were some issues I had that prevented me from using either.  
I originally started with ng-grid, and really wanted to use it.

Smart Table
-----------

* My use case required fixed headers, and its lack of support for that was a deal breaker.

ng-grid
-------

* No declarative configuration and customization.  You have to edit templates and options in javascript.
* A serious, dealbreaker bug where the selected row changes when you sort the columns.  I filed the bug
and after over a week no one working on it has responded.
* A serious, dealbreaker design issue where the column used to house the scrollbar appears even if no scrollbar is present.
I implemented a workaround by using a negative left margin for the content I needed to be flush to the right of the grid.
This sort of worked, but wasn't pixel perfect and felt hacky.
* The code was too lengthy for my taste.  Weighing in at 3,400 lines, it supported a ton of 
functionality that I would never need.
* Making the container height 100% prevented content below it from being flush to the bottom margin.
* It requires jquery.  I'm working hard to completely remove jquery from my app and this would be another
spot requiring me to keep it.

Contributing
------------

I'd love to see pull requests come in.  Please make sure though that anything you send in uses a 100%
declarative configuration, and is an actual use case you are using for a production app.  If there are not real 
use cases for features, I won't add them.

Discuss on Hacker News:



Follow me on Twitter:
https://twitter.com/david_j_nelson

