/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 0.008212321715082235, "KoPercent": 99.99178767828492};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [5.504002851597668E-5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, ""], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Change"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Get_id"], "isController": false}, {"data": [0.24752475247524752, 500, 1500, "HTTP_Request_Get_characters"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP_Request_create_character"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Delete"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2289243, 2289055, 99.99178767828492, 0.0909938350799824, 0, 3188, 0.0, 0.0, 0.0, 0.0, 5281.154117663343, 13.382973138959892, 0.23149411426636893], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 2288738, 2288738, 100.0, 1.5510731241409696E-4, 0, 2, 0.0, 0.0, 0.0, 0.0, 5449.389165212298, 0.0, 0.0], "isController": false}, {"data": ["HTTP_Request_Change", 101, 101, 100.0, 105.3267326732673, 5, 302, 85.0, 249.59999999999997, 270.7, 301.56000000000006, 28.346898680886895, 7.557327480353634, 6.475516594162222], "isController": false}, {"data": ["HTTP_Request_Get_id", 101, 101, 100.0, 81.33663366336636, 6, 289, 66.0, 185.2, 267.7, 288.80000000000007, 27.94687327061428, 7.4506800809352525, 4.706090896513558], "isController": false}, {"data": ["HTTP_Request_Get_characters", 101, 14, 13.861386138613861, 1693.4653465346535, 139, 3188, 1777.0, 3143.8, 3183.9, 3187.98, 27.386117136659436, 1543.647153775759, 3.3697761320498913], "isController": false}, {"data": ["HTTP_Request_create_character", 101, 0, 0.0, 99.30693069306929, 3, 268, 85.0, 197.0, 258.59999999999997, 267.98, 23.37962962962963, 6.347204137731481, 5.068630642361111], "isController": false}, {"data": ["HTTP_Request_Delete", 101, 101, 100.0, 79.49504950495052, 4, 241, 59.0, 166.19999999999993, 204.89999999999998, 240.94, 22.600134258223314, 6.025231105952114, 5.804963708324009], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 3,024 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,139 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["/FINISH", 1144369, 49.99307574523111, 49.98897015301565], "isController": false}, {"data": ["The operation lasted too long: It took 3,067 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["404/Not Found", 303, 0.013236903438318433, 0.013235816381222964], "isController": false}, {"data": ["The operation lasted too long: It took 3,153 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,184 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,188 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,179 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,120 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,145 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,185 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, 8.737229992289395E-5, 8.736512462853441E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,187 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,181 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["The operation lasted too long: It took 3,183 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, 4.3686149961446975E-5, 4.3682562314267204E-5], "isController": false}, {"data": ["/START", 1144369, 49.99307574523111, 49.98897015301565], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2289243, 2289055, "/FINISH", 1144369, "/START", 1144369, "404/Not Found", 303, "The operation lasted too long: It took 3,185 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 3,024 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 2288738, 2288738, "/FINISH", 1144369, "/START", 1144369, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Change", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Get_id", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Get_characters", 101, 14, "The operation lasted too long: It took 3,185 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 2, "The operation lasted too long: It took 3,024 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 3,139 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 3,067 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1, "The operation lasted too long: It took 3,153 milliseconds, but should not have lasted longer than 3,000 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP_Request_Delete", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
