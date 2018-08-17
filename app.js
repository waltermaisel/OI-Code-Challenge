const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });

var clientReqCountObj = {}

function hitCount(ipAddr) {
	if (ipAddr in clientReqCountObj) clientReqCountObj[ipAddr] += 1
	else clientReqCountObj[ipAddr] = 1
}

var calcArithmeticObj = {
	'+': function (x, y) { return Number(x) + Number(y) },
	'-': function (x, y) { return Number(x) - Number(y) },
	'*': function (x, y) { return Number(x) * Number(y) },
	'/': function (x, y) { return Number(x) / Number(y) }
}

app.use(function (req, res, next) {
	hitCount(req.ip)
	next()
})

app.use('/assets',express.static(__dirname + '/assets'));

app.get('/game', function (req, res) {
    res.sendFile(__dirname + '/game.html');
});

app.get('/', (req, res) => res.send("You\'ve visited this website " + clientReqCountObj[req.ip] + " times."))

app.get('/math', function (req, res) {
	var html = '';
	html += "<body>";
	html += "<h1>Arithmetic Calculator</h1>";
	html += "<form action='/math'  method='post'>";
    html += "simple expression \(i.e. a + b * c - d\): <input type= 'text' name='expression'><input type='submit' value='submit'>";
    html += "<br><br>\(order of operations is accounted for, <br>no parenthetical grouping please\)";
    html += "</form>";
    html += "</body>";
    res.send(html);
})

app.post('/math', urlencodedParser, function (req, res) {
	var reply = '';
	var exprArr = req.body.expression.trim().split(" ");
	var o;
	var p;
	var q;
	function simpExpr(arr, i) {
		i += 1;
		if (typeof arr[i] === 'undefined') {
			p = arr;
			return
		}
		if (!arr[i].match(/(\*|\/)/)) {
			simpExpr(arr, i+1)
		}
		if (typeof p === 'undefined' && arr[i].match(/(\*|\/)/)) {
			arrHandler(arr.slice(i-1, i+2));
			simpExpr(arr.slice(0, i-1)
			.concat([o].map(x => x.toString()))
			.concat(arr.slice(i+2, arr.length+1)), 0);	
		}
	}
	function arrHandler (arr, n) {
		if (arr.length > 3) {
			arrHandler(arr.slice(0, 3), 0)
			arrHandler(m.concat(arr.slice(3)).map(x => x.toString()), 0);
			return
		} else if (isNaN(arr[arr.length-1]) || // check that last element is a #
			isNaN(arr[n]) && n % 2 == 0 ||     // check that even# elements are #s
			typeof arr[n] != 'undefined' &&    // check that odd# elements are operators
			!arr[n].match(/(\+|\-|\*|\/)/) && 
			n % 2 != 0) {
				o = "Please enter a simple, valid arithmetic expression."
				return
		} else if (typeof arr[n+1] === 'undefined') {
			m = [calcArithmeticObj[arr[1]](arr[0], arr[2])];
			o = m[0]
			return
		} else {
			arrHandler(arr, n+1)
		};
	};
	simpExpr(exprArr, 0);
	arrHandler(p, 0);
	reply += o;
    res.send(reply);
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))