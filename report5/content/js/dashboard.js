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

    var data = {"OkPercent": 0.011222586320393114, "KoPercent": 99.98877741367961};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [8.291313774021779E-5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, ""], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Change"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Get_id"], "isController": false}, {"data": [0.47029702970297027, 500, 1500, "HTTP_Request_Get_characters"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP_Request_create_character"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Delete"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1791031, 1790830, 99.98877741367961, 0.07496855163311161, 0, 2025, 0.0, 0.0, 0.0, 0.0, 4207.172035357486, 11.764693575893391, 0.23571660380095324], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 1790526, 1790526, 100.0, 1.7536746185199277E-4, 0, 14, 0.0, 0.0, 0.0, 0.0, 4263.16729325546, 0.0, 0.0], "isController": false}, {"data": ["HTTP_Request_Change", 101, 101, 100.0, 64.48514851485147, 8, 214, 42.0, 134.8, 147.7, 213.16000000000017, 45.028979045920636, 12.004796171422203, 10.286342231386536], "isController": false}, {"data": ["HTTP_Request_Get_id", 101, 101, 100.0, 96.58415841584159, 12, 239, 104.0, 158.6, 169.89999999999998, 237.9000000000002, 46.84601113172541, 12.48921976461039, 7.888595779220779], "isController": false}, {"data": ["HTTP_Request_Get_characters", 101, 1, 0.9900990099009901, 1042.4356435643563, 24, 2025, 892.0, 1847.4, 1880.8999999999999, 2023.9600000000003, 43.91304347826087, 2130.493800951087, 5.403362771739131], "isController": false}, {"data": ["HTTP_Request_create_character", 101, 0, 0.0, 59.900990099009924, 9, 158, 45.0, 119.0, 127.79999999999998, 157.96, 45.784224841341796, 12.429701665911152, 9.925876869900272], "isController": false}, {"data": ["HTTP_Request_Delete", 101, 101, 100.0, 62.90099009900985, 3, 141, 56.0, 123.0, 130.89999999999998, 140.98000000000002, 42.526315789473685, 11.337582236842104, 10.923108552631579], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["/FINISH", 895263, 49.991512315518506, 49.985901974896024], "isController": false}, {"data": ["The operation lasted too long: It took 2,025 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.584002948353557E-5, 5.5833762788025444E-5], "isController": false}, {"data": ["404/Not Found", 303, 0.01691952893351128, 0.01691763012477171], "isController": false}, {"data": ["/START", 895263, 49.991512315518506, 49.985901974896024], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1791031, 1790830, "/FINISH", 895263, "/START", 895263, "404/Not Found", 303, "The operation lasted too long: It took 2,025 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 1790526, 1790526, "/FINISH", 895263, "/START", 895263, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Change", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Get_id", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Get_characters", 101, 1, "The operation lasted too long: It took 2,025 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP_Request_Delete", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
