fetch("https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=5&token=5bTDfSmR2ieax6y7JUqDAD")
  .then(res => res.json())
  .then(data => {
    console.log("🔍 stocks preview:", data.stocks.slice(0, 3));
  })
  .catch(err => console.error(err));
