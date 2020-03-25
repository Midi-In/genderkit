window.onload = (e) => {
    getData();
};

var db = {};
var index = {};
var lastkey = 0;
var query = "";

function getData()
{
    fetch("/assets/json/search-index.json")
        .then(response => response.json())
        .then(data => { 
            db = data;
            index = new quickScore.QuickScore(
                data, 
                [
                    {name: "title", scorer: quickScore.quickScore}, 
                    {name: "details", scorer: quickScore.quickScore}, 
                    {name: "tagString", scorer: (string, query) => 
                        string
                            .split(",")
                            .map((i) => quickScore.quickScore(i, query))
                            .reduce(( acc, cur ) => Math.max( acc, cur ), 0)
                    }
                ]
            );
            update();
        })
}

function update()
{
    if (Date.now() - lastkey > 100)
    {
        var results = [];
        if (!query || query == "") 
        { 
            results = db
                .filter(i => i.kind == "category");
        } 
        else 
        { 
            var results = index
                .search(query)
                .slice(0, 50)
                .filter(i => i.score > 0.5)
                .filter(i => (i.matches.title.length <= 2 && i.matches.title.length > 0) 
                    || (i.matches.details.length <= 2 && i.matches.details.length > 0))
                .map(i => i.item);
        }
    
        if (results.length > 0)
        {
            document.getElementById("publications").outerHTML = Handlebars.templates.publications(results);
        }
        else
        {
            // do something to indicate nothing was found
            document.getElementById("publications").innerHTML = "No results found."
        }

        document.getElementById("publications").className = query.length > 0 ? "results" : "results grid"
    }
}

document.getElementById("searchbox").ontouchstart = (e) => {
    document.getElementById("search").scrollIntoView()
};

document.getElementById("searchbox").oninput = (e) => {
    lastkey = Date.now();
    query = e.target.value.toLowerCase();

    // Wait a few milliseconds to see if the user changes their mind and types something else
    setTimeout(update, 150);
};
