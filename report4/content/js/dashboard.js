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

    var data = {"OkPercent": 0.009684655307443021, "KoPercent": 99.99031534469256};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [7.949254645415659E-5, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, ""], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Change"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Get_id"], "isController": false}, {"data": [0.40594059405940597, 500, 1500, "HTTP_Request_Get_characters"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP_Request_create_character"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP_Request_Delete"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1786331, 1786158, 99.99031534469256, 0.09437388703437506, 0, 2552, 0.0, 0.0, 0.0, 0.0, 4240.095420073821, 11.00725794128817, 0.23818625829288265], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 1785826, 1785826, 100.0, 1.6182987592296282E-4, 0, 2, 0.0, 0.0, 0.0, 0.0, 4251.106323720199, 0.0, 0.0], "isController": false}, {"data": ["HTTP_Request_Change", 101, 101, 100.0, 74.31683168316829, 4, 213, 53.0, 142.0, 183.89999999999964, 212.96, 37.757009345794394, 10.066077686915888, 8.625146028037383], "isController": false}, {"data": ["HTTP_Request_Get_id", 101, 101, 100.0, 117.90099009900992, 8, 344, 81.0, 258.8, 264.0, 343.74000000000007, 36.252692031586506, 9.66502434045226, 6.104742462311558], "isController": false}, {"data": ["HTTP_Request_Get_characters", 101, 29, 28.712871287128714, 1301.792079207921, 24, 2552, 1293.0, 2353.7999999999997, 2461.9999999999995, 2551.86, 36.76738259919913, 1648.745008759556, 4.52411153076083], "isController": false}, {"data": ["HTTP_Request_create_character", 101, 0, 0.0, 92.37623762376238, 4, 230, 80.0, 224.0, 226.0, 229.98000000000002, 40.497193263833196, 10.994355202485965, 8.779664945870087], "isController": false}, {"data": ["HTTP_Request_Delete", 101, 101, 100.0, 79.89108910891088, 1, 228, 79.0, 144.6, 165.59999999999997, 227.92000000000002, 42.59805989034163, 11.356709326233657, 10.94153640341628], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 2,337 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,315 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,285 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["404/Not Found", 303, 0.01696378483874327, 0.01696214195465454], "isController": false}, {"data": ["The operation lasted too long: It took 2,426 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,196 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,512 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,218 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,545 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,204 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["/START", 892913, 49.990706309296264, 49.98586488170445], "isController": false}, {"data": ["The operation lasted too long: It took 2,219 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,392 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,175 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,164 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["/FINISH", 892913, 49.990706309296264, 49.98586488170445], "isController": false}, {"data": ["The operation lasted too long: It took 2,417 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,120 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,189 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,209 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 1.1197217715342091E-4, 1.1196133303402337E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,210 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,212 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 1.1197217715342091E-4, 1.1196133303402337E-4], "isController": false}, {"data": ["The operation lasted too long: It took 2,407 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,537 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,552 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,466 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,358 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,231 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 5.5986088576710456E-5, 5.5980666517011684E-5], "isController": false}, {"data": ["The operation lasted too long: It took 2,213 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 1.1197217715342091E-4, 1.1196133303402337E-4], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1786331, 1786158, "/START", 892913, "/FINISH", 892913, "404/Not Found", 303, "The operation lasted too long: It took 2,209 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,212 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["", 1785826, 1785826, "/FINISH", 892913, "/START", 892913, "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Change", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Get_id", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["HTTP_Request_Get_characters", 101, 29, "The operation lasted too long: It took 2,209 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,212 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,213 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 2,337 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 2,315 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": [], "isController": false}, {"data": ["HTTP_Request_Delete", 101, 101, "404/Not Found", 101, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
