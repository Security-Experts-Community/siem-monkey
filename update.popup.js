 let margin = {top: 30, right: 20, bottom: 30, left: 20} 
 let barHeight = 20 
    

let i = 0
let duration = 100;
let root;

function elbow(d, i) {
    return `M${d.source.y+10} ${d.source.x+10} V ${d.target.x} H ${d.target.y}`;
}

var svg;

// Toggle children on click.
function d3_tree_click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

// Toggle children on click.
function d3_process_line_click(d) {
    // Открыть в новой вкладке события, связанные с процессом
    if('object.process.guid' in d.data.original) {
        condition = `event_src.host = '${d.data.original['event_src.host']}'`+
        ` and (object.process.guid = '${d.data.original['object.process.guid']}'`+
        ` or subject.process.guid = '${d.data.original['object.process.guid']}')`;
      }
      else {
        condition = `event_src.host = '${d.data.original['event_src.host']}'`+
        ` and (object.process.id = ${d.data.original['object.process.id']})`;
      }

      if(typeof(chrome.tabs) !== 'undefined') { // если вызов из popup плагина
        chrome.tabs.create({url: `${siemUrl}/#/events/view?where=${condition}`});  
      }
      else {
        window.open(`${siemUrl}/#/events/view?where=${condition}`, "_blank");
      }
  }


function color(d) {
  return d._children ? "#c6dbef" : d.children ? "#c6dbef" : "#6fba53";
}


function fontweight(d) {
    return d.data.elemClass == "alarm" ? "bold" : "normal";
}


function update(source) {

    // Compute the flattened node list.
    let nodes = root.descendants();

    let height = Math.max(500, nodes.length * (barHeight + 7) + margin.top + margin.bottom);

    d3.select("svg").transition()
        .duration(duration)
        .attr("height", height);

    let index = -1;
    root.eachBefore(function (n) {
        n.x = ++index * (barHeight + 7); // 7 - промежуток по вертикали для лучшего визуального восприятия
        n.y = n.depth * 20;
    });

    // Update the nodes…
    let node = svg.selectAll(".node")
        .data(nodes, function (d) { return d.id || (d.id = ++i); });

    let nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .style("opacity", 0);

    // Enter any new nodes at the parent's previous position.
    nodeEnter.append("rect")
        .attr("y", -barHeight / 2)
        .attr("height", barHeight)
        .attr("width", 20)
        .attr("class", "noderect")
        .style("fill", color)
        .on("click", d3_tree_click);

    nodeEnter.append("text")
        .attr("dy", 3.5)
        .attr("dx", 25.5)
        .style("font-weight", fontweight)
        .text(function (d) { return d.data.name; });

    nodeEnter.insert("rect", ":first-child")
        .attr("y", -barHeight / 2)
        .attr("x", 20)
        .attr("height", barHeight)
        //.attr("width", barWidth - 20)
        .attr("width", function () { return d3.select(this.parentNode).select("text").node().getComputedTextLength() + 11; })
        .on("click", d3_process_line_click);

    // Transition nodes to their new position.
    nodeEnter.transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);

    node.transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
        .select("rect");
        //.style("fill", color);

    node.select("rect.noderect")
        .style("fill", color);


    // Transition exiting nodes to the parent's new position.
    node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
        .style("opacity", 0)
        .remove();

    // Update the links…
    let link = svg.selectAll(".link")
        .data(root.links(), function (d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", elbow)
        .transition()
        .duration(duration)
        .attr("d", elbow);

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", elbow);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", elbow)
        .remove();

    // Stash the old positions for transition.
    root.each(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}
