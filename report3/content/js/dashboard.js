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

    var data = {"OkPercent": 0.007049947483865777, "KoPercent": 99.99295005251614};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [5.5961447541420435E-5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, ""], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Change"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Get_id"], "isController": false}, {"data": [0.3910891089108911, 500, 1500, "HTTP_Request_Get_characters"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP_Request_create_character"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Delete"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2510657, 2510480, 99.99295005251614, 0.05814055842753946, 0, 2464, 0.0, 0.0, 0.0, 0.0, 5916.295718523999, 9.119808689730254, 0.23646425274470206], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 2510152, 2510152, 100.0, 1.6652378023322603E-4, 0, 8, 0.0, 0.0, 0.0, 0.0, 5976.580840861147, 0.0, 0.0], "isController": false}, {"data": ["HTTP_Request_Change", 101, 101, 100.0, 56.08910891089109, 4, 211, 37.0, 119.0, 191.09999999999934, 210.76000000000005, 39.33021806853582, 10.485497590537383, 8.98452711253894], "isController": false}, {"data": ["HTTP_Request_Get_id", 101, 101, 100.0, 78.75247524752476, 5, 240, 67.0, 190.59999999999997, 208.7, 239.88000000000002, 38.78648233486943, 10.340536794354838, 6.531418010752688], "isController": false}, {"data": ["HTTP_Request_Get_characters", 101, 25, 24.752475247524753, 1198.6435643564357, 17, 2464, 1111.0, 2166.0, 2455.0, 2463.9, 37.984204588191055, 1414.799604527078, 4.67383767393757], "isController": false}, {"data": ["HTTP_Request_create_character", 101, 0, 0.0, 60.990099009900995, 3, 172, 36.0, 150.0, 166.0, 171.98000000000002, 39.607843137254896, 10.736060049019608, 8.58685661764706], "isController": false}, {"data": ["HTTP_Request_Delete", 101, 101, 100.0, 46.64356435643563, 3, 168, 36.0, 106.39999999999998, 142.29999999999978, 167.94, 41.35954135954136, 11.0265183507371, 10.623416385135135], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,103 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,456 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,410 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,093 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 3, 1.1949905994072846E-4, 1.1949063531975893E-4], "isController": false}, {"data": ["/FINISH", 1255076, 49.99346738472324, 49.989942871527255], "isController": false}, {"data": ["The operation lasted too long: It took 2,105 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,458 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,108 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,097 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 7.966603996048565E-5, 7.966042354650595E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,099 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["404/Not Found", 303, 0.012069405054013575, 0.012068554167295652], "isController": false}, {"data": ["The operation lasted too long: It took 2,236 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,126 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,102 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,176 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,418 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,459 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,455 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 7.966603996048565E-5, 7.966042354650595E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,464 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,098 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 7.966603996048565E-5, 7.966042354650595E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,107 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,014 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 3.9833019980242825E-5, 3.9830211773252976E-5], "isController": false}, {"data": ["/START", 1255076, 49.99346738472324, 49.989942871527255], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2510657, 2510480, "/FINISH", 1255076, "/START", 1255076, "404/Not Found", 303, "The operation lasted too long: It took 2,093 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 3, "The operation lasted too long: It took 2,097 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 2510152, 2510152, "/FINISH", 1255076, "/START", 1255076, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Change", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Get_id", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Get_characters", 101, 25, "The operation lasted too long: It took 2,093 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 3, "The operation lasted too long: It took 2,097 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,455 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,098 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,103 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP_Request_Delete", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
