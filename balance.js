
console.log('hello world')

/**
 * @typedef {object} Lane
 * @property {string} target
 * @property {number} slot
*/

/**
 * @typedef {Lane[]} Route
*/

/**
 * @typedef {object} Balancer
 * @property {string} id
 * @property {Route} route
*/

/**
 * @typedef {object} Widget
 * @property {Balancer} input
 * @property {Balancer[]} pathway
*/





/**
 * 
 * @param {Widget} widget 
 * @param {Lane[]} externalRoute 
 * @returns 
 */
function calculateWidget(widget, externalRoute) {
	// Build lookup table of all balancers
	const balancers = new Map();
	balancers.set(widget.input.id, widget.input);
	for (const b of widget.pathway) balancers.set(b.id, b);

	// Count how many output lanes the widget produces
	function countOutputs(route) {
		let count = 0;
		for (const split of route) {
			if (split.target === 'output') {
				count++;
			} else {
				const next = balancers.get(split.target);
				if (!next) throw new Error(`Unknown balancer: ${split.target}`);
				count += countOutputs(next.route);
			}
		}
		return count;
	}

	const expected = countOutputs(widget.input.route);
	if (externalRoute.length !== expected) {
		throw new Error(
			`Widget requires ${expected} output routes but got ${externalRoute.length}`
		);
	}

	// Resolve widget routing into factory routing
	let outputIndex = 0;

	function resolve(route) {
		const result = [];
		for (const split of route) {
			if (split.target === 'output') {
				const ext = externalRoute[outputIndex++];
				result.push({ ...ext, weight: split.weight ?? 1 });
			} else {
				const next = balancers.get(split.target);
				result.push(...resolve(next.route));
			}
		}
		return result;
	}

	return [ resolve(widget.input.route) ];
}





// --------------------Testing--------------------

// Simple
/**@type {Widget} */
const widget1 = {
	input:{
		id:'input',
		route:[
			{target:'1', slot:0}
		]
	},
	pathway:[
		{
			id:'1',
			route:[
				{target:'output', slot:0}
			]
		},
	]
}
/*
With parameter: [{target:'furnace', slot:0}]
Expected return value:
[[
	{target:'furnace', slot:0, weight:1}
]]
*/
try {
	console.log(
	  calculateWidget(widget1, [{target:'furnace', slot:0}])
	);
} catch (error) {
	console.log('error thrown:', error)
}

// Splitting
/**@type {Widget} */
const widget2 = {
	input:{
		id:'input',
		route:[
			{target:'1', slot:0}
		]
	},
	pathway:[
		{
			id:'1',
			route:[
				{target:'output', slot:0},
				{target:'output', slot:1},
				{target:'output', slot:2}
			]
		},
	]
}
/*
With parameter: [{target:'furnace', slot:0}]
Expected return value:
ERROR thrown

With parameter: [{target:'furnace', slot:0}, {target:'furnace', slot:1}, {target:'farm', slot:0}]
Expected return value:
[[
	{target:'furnace', slot:0, weight:1},
	{target:'furnace', slot:1, weight:1},
	{target:'farm', slot:0, weight:1}
]]
*/
try {
	console.log(
	  calculateWidget(widget2, [{target:'furnace', slot:0}])
	);
} catch (error) {
	console.log('error thrown:', error)
}
try {
	console.log(
	  calculateWidget(widget2, [{target:'furnace', slot:0}, {target:'furnace', slot:1}, {target:'farm', slot:0}])
	);
} catch (error) {
	console.log('error thrown:', error)
}

// Merging
/**@type {Widget} */
const widget3 = {
	input:{
		id:'input',
		route:[
			{target:'1', slot:0},
			{target:'1', slot:1},
			{target:'1', slot:2}
		]
	},
	pathway:[
		{
			id:'1',
			route:[
				{target:'output', slot:0}
			]
		},
	]
}
/*
With parameter: [{target:'furnace', slot:0}]
Expected return value:
[[
	{target:'furnace', slot:0, weight:1}
],[
	{target:'furnace', slot:0, weight:1}
],[
	{target:'furnace', slot:0, weight:1}
]]
*/
try {
	console.log(
	  calculateWidget(widget3, [{target:'furnace', slot:0}])
	);
} catch (error) {
	console.log('error thrown:', error)
}

// Balancing
/**@type {Widget} */
const widget4 = {
	input:{
		id:'input',
		route:[
			{target:'1', slot:0},
			{target:'1', slot:1}
		]
	},
	pathway:[
		{
			id:'1',
			route:[
				{target:'output', slot:0},
				{target:'output', slot:1}
			]
		},
	]
}
/*
With parameter: [{target:'furnace', slot:0},{target:'furnace', slot:1}]
Expected return value:
[[
	{target:'furnace', slot:0, weight:1},
	{target:'furnace', slot:1, weight:1}
],[
	{target:'furnace', slot:0, weight:1},
	{target:'furnace', slot:1, weight:1}
]]
*/
try {
	console.log(
	  calculateWidget(widget4, [{target:'furnace', slot:0},{target:'furnace', slot:1}])
	);
} catch (error) {
	console.log('error thrown:', error)
}

// Insanity
/**@type {Widget} */
const widget5 = {
	input:{
		id:'input',
		route:[
			{target:'1', slot:0},
			{target:'2', slot:0},
			{target:'3', slot:0}
		]
	},
	pathway:[
		{
			id:'1',
			route:[
				{target:'2', slot:2},
				{target:'3', slot:1},
				{target:'output', slot:2},
			]
		},
		{
			id:'2',
			route:[
				{target:'4', slot:0},
				{target:'3', slot:3},
			]
		},
		{
			id:'3',
			route:[
				{target:'1', slot:1},
				{target:'3', slot:2},
				{target:'output', slot:0},
			]
		},
		{
			id:'4',
			route:[
				{target:'output', slot:1},
				{target:'1', slot:2},
			]
		},
	]
}
/*
With parameter: [{target:'thing', slot:0},{target:'thing', slot:1},{target:'thing', slot:2},{target:'thing', slot:3}]
Expected return value:
???????????????????
*/












