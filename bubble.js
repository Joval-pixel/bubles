// Adiciona texto formatado ao centro da bolha
bubble.append("text")
  .text(`${stock.symbol}\n${stock.changesPercentage.toFixed(2)}%`)
  .attr("dy", ".35em")
  .style("font-size", d => Math.max(10, Math.min(d.r / 4, 16)) + "px")
  .style("white-space", "pre-line")
  .style("text-anchor", "middle")
  .style("fill", "#fff")
  .style("font-weight", "bold");
