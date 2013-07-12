Angular Table
=============

An angular directive for a table with fixed, sortable headers, row selection, row even/odd coloring, 
which automatically stays the correct height relative to its container when the browser is resized. 
No javascript code required; the api is a 100% declarative dsl.

Quick Start
-----------

* include [angular.js](https://ajax.googleapis.com/ajax/libs/angularjs/1.0.7/angular.min.js), 
[angular-table.js](https://raw.github.com/davidjnelson/angular-table/master/src/main/webapp/js/lib/angular-table.js), 
and [angular-table.css](https://raw.github.com/davidjnelson/angular-table/master/src/main/webapp/css/lib/angular-table.css).
* Put this in your template: 

```html

<angular-table model="[ { id: 1, name: 'Bob', street: '1 street ave' } ]" 
    filter-query-model="filterQuery" default-sort-column="id">
    <header-row>
        <header-column sortable="true" sort-field-name="id">
            <div style="display: inline-block;">Id</div>
            <sort-arrow-ascending></sort-arrow-ascending>
            <sort-arrow-descending></sort-arrow-descending>
        </header-column>
        <header-column sortable="false" sort-field-name="name">
            Name
        </header-column>
        <header-column sortable="true" sort-field-name="street">
            <div style="display: inline-block;">Street</div>
            <sort-arrow-ascending></sort-arrow-ascending>
            <sort-arrow-descending></sort-arrow-descending>
        </header-column>
    </header-row>

    <row on-selected="handleRowSelection(row)" selected-color="#87cefa" 
        even-color="#ffffff" odd-color="#eeeeee">
        <column>{{ row.id }}</column>
        <column>{{ row.name }}</column>
        <column>{{ row.street }}</input></column>
    </row>
</angular-table>

```

# [Angular Table Live Demo](http://angulartable.com/demo/index.html)

Philosophy:
-----------

Start with a solid foundation of an easy to use api, provided as a custom html tag, also known as a 
domain specific language.  Only implement features with use cases in apps being pushed to production.  Keep the
code clean, lean, and blazing fast.

Features:
---------

* 100% declarative dsl - no javascript required
* fixed headers
* sortable headers
* pass a model on the parent scope to filter data by
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

Styling the grid:
-----------------

You can put your own classes and styles on any of the custom elements.

So for your example, if you want to use the bootstrap progress bar in one of your columns, on the:

```html
<column>
```

element you can just add the progress class to it directly like this:

```html
<column class="progress">
```

You can also edit the angular-table.css file as needed, and/or inherit from its classes in your own css file.

Styling the ascending / descending icons:
-----------------------------------------

* To use the default styling, ensure your header text is in an element with the style:  display: inline-block applied
so that the icon and your header text aligns.
* To customize the styling, remove or change the classes 'angularTableDefaultSortArrowAscending' and
'angularTableDefaultSortArrowDescending' in angular-table.css.

Temporary workaround to [issue 8](https://github.com/davidjnelson/angular-table/issues/8) (transcluded expressions not executing in parent scope)
---------------------------------------------------------------------------------
Should have this fixed in the near future, but in the meantime you can prepend "parent." to any expression you want
evalued in the parent scope, for example:

```html

<column><a href ng-click="parent.inParentScope(row)">should call parent scope</a></column>

```

How to use angular-table with jade templates:
---------------------------------------------

It will work, but you have to be very careful with the tabs.  Here is a working example:

https://github.com/davidjnelson/angular-table/issues/18

Supported browsers:
-------------------
All modern browsers are supported: 
* Windows: Chrome latest, Firefox latest, Internet Explorer 9+
* OSX: Chrome latest, Firefox latest, Safari Latest
* IE8<, IOS 4<, and Android 3< are not currently supported since they don't support getComputedStyle.  The project I 
built this for doesn't have to support IE8<, but if you do and want to add support, let me know.  This would be a 
fantastic pull request :-)

Running a local demo:
---------------------
* git clone https://github.com/davidjnelson/angular-table.git
* cd angular-table
* mvn jetty:run
* visit http://localhost:8090 in your browser

Why Not Use ng-grid or smart table?
-----------------------------------

While I deeply respect the work these folks have done, there were some issues I had that prevented me from using either.  
I originally started with ng-grid, and really wanted to use it.

**Smart Table**

* My use case required fixed headers, and its lack of support for that was a deal breaker.

**ng-grid**

* No declarative configuration and customization.  You have to edit templates and options in javascript.
* A serious, dealbreaker bug where the selected row changes when you sort the columns.  I filed the bug
and after over a week no one working on it has responded.
* A serious, dealbreaker design issue where the column used to house the scrollbar appears even if no scrollbar is present.
I implemented a workaround by using a negative left margin for the content I needed to be flush to the right of the grid.
This sort of worked, but wasn't pixel perfect and felt hacky.
* The code was too lengthy for my taste.  Weighing in at 3,400 lines, it supported a ton of 
functionality that I would never need.
* It requires jquery.  I'm working hard to completely remove jquery from my app and this would be another
spot requiring me to keep it.

Contributing And Feature Requests
---------------------------------

I'd love to see both pull requests and feature requests come in.  Please make sure though that anything you send in uses a 100%
declarative configuration, and is an actual use case you are using for a production app.  If there are not real 
use cases for features, I won't add them.

Interact
--------

**Discuss existing and create new potential-feature-discussion issues**

Please take a look at potential new features others have proposed and share your thoughts on them.
Also, please add new potential features that you need in your apps.  Thanks!

https://github.com/davidjnelson/angular-table/issues?labels=potential-feature-discussion&page=1&state=open

Discuss on Hacker News:
https://news.ycombinator.com/item?id=5920569

Follow me on Twitter:
https://twitter.com/david_j_nelson

License
-------

The MIT License (MIT)

Copyright (c) 2013 David Nelson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
