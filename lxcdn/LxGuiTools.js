/*****************************************************************
 *   LightningX - GUI Tools to easy derivate in WebApps
 *
 *   Coded by : Ramiro Pedro Laura Murillo :: 20-04-2020
 *   
 *   Modules: 
 *     -> lxLineChart
 *     -> lxPie 
 *     -> lxBarChart
 *     -> lxControl Id
 *
 ****************************************************************/ 
/*
  Usage:

  var obj = lxLineChart( "myAreaChart" );
  var labs = obj.config.data.labels;
  var data = obj.config.data.datasets[0].data
*/
function lxLineChart( IdCanvas, data, labs )
{
    var myLineContx = document.getElementById(IdCanvas);
    return new Chart(myLineContx, {
        type: 'line',
        data: {
            labels: (labs? labs : []),
            datasets: [{
                label: "Datos",
                lineTension: 0.3,
                backgroundColor: "rgba(2,117,216,0.2)",
                borderColor: "rgba(2,117,216,1)",
                pointRadius: 5,
                pointBackgroundColor: "rgba(2,117,216,1)",
                pointBorderColor: "rgba(255,255,255,0.8)",
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(2,117,216,1)",
                pointHitRadius: 20,
                pointBorderWidth: 2,
                data: (data? data : []),
            }],
        },
        options: {
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 5
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        maxTicksLimit: 5
                    },
                    gridLines: {
                        color: "rgba(0, 0, 0, .125)",
                    }
                }],
            },
            legend: {
                display: false
            }
        }
    });
}

function lxPieChart( IdCanvas, data, labs )
{
    var ctx = document.getElementById( IdCanvas );
    return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: (labs? labs : []),   //arrPieLab, //["Puno", "Ilave", "Juliaca"],
                datasets: [{
                    data: (data? data : []), //arrPieDat, //[ 45, 20, 30 ],
                    backgroundColor: [ '#007bff', '#ffc107', '#dc3545', '#28a745', '#007bff', '#dc3545', '#ffc107', '#28a745', '#dc3545', '#ffc107', '#28a745'],
                }],
            },
        });
}

function lxBarChart( IdCanvas, arrLabel, arrData )
{
    var ctx = document.getElementById( IdCanvas );
    return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: (arrLabel? arrLabel : []), // [ ],
                datasets: [{
                    data: (arrData? arrData : []), // [ ],
                    label: "Revenue",
                    backgroundColor: [ '#007bff99', '#ffc107', '#dc3545', '#28a745', '#007bff', '#dc3545', '#ffc107', '#28a745'],
                    borderColor: "rgba(2,117,216,1)",
                }],
            },
            options: {
                scales: {
                    xAxes: [{
                        time: {
                            unit: 'month'
                        },
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 6
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            min: 0,
                            maxTicksLimit: 5
                        },
                        gridLines: {
                            display: true
                        }
                    }],
                },
                legend: {
                    display: false
                }
            }
        });    
}

//------------------------------------------------------------------------------------------
// Funciones extra
//------------------------------------------------------------------------------------------
function lxControl( idCtrl )
{
    return document.getElementById( idCtrl );
}

function lxRndColor()
{
    var chars = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += chars[Math.floor(Math.random() * 16)];
    }
    return color;
}

function randomScalingFactor()
{
    return (Math.random() > 0.5 ? 1.0 : -1.0) * Math.random() * 100;
}

function lxRand( max )
{
    return  Math.trunc(Math.random() * max);
}

//- EOF