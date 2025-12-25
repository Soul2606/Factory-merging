
class Fraction {
	constructor(num=0, den=1) {
		this.num = num
		this.den = den
	}

	add(value){
		if (value instanceof Fraction) {
			this.num += this.den * value.num
			this.den *= value.den
		} else if (typeof value === 'number') {
			this.num += this.den * value
		}
		return this
	}

	subtract(value){
		if (value instanceof Fraction) {
			this.num -= this.den * value.num
			this.den *= value.den
		} else if (typeof value === 'number') {
			this.num -= this.den * value
		}
		return this
	}

	multiply(value){
		if (value instanceof Fraction) {
			this.num *= value.num
			this.den *= value.den
		} else if (typeof value === 'number') {
			this.num *= value
		}
		return this
	}

	divide(value){
		if (value instanceof Fraction) {
			this.num *= value.den
			this.den *= value.num
		} else if (typeof value === 'number') {
			this.den *= value
		}
		return this
	}
}



class Factory {
	constructor(inputs=[], outputs=[], time=1) {
		this.input = inputs
		this.outputs = outputs
		this.time = time
		this.strict = false
		this.util = new Fraction(1,1)
	}
}



// Factory pathway
const pathway = {
	input:[
		[{target:'balance', id:'stone', slot:0}]
	],
	pathway:[
		{
			id:'balance',
			process:'balance',
			route:[
				{target:'crack', slot:0}
			]
		},
		{
			id:'crack',
			process:'crack',
			parameters:{util:'1', strict:true},
			route:[{target:'split1', slot:0}]
		},
		{
			id:'split1',
			process:'balance',
			parameters:{weightsOut:[2,1]},
			route:[
				{target:'output', slot:0}, 
				{target:'balance', slot:1}
			]
		}
	]
}


function calculate(pathway, factories) {
	const factoryNodes = pathway.pathway.filter(v=>
		factories.some(f=>
			v.process === f.id
		)
	).map(v=>{
		return {
			node:v,
			factory:factories.find(f=>f.id === v.process)
		}
	})

	console.log(factoryNodes)

	const checkedNodes = new Map()
	function routeTo(setRoute) {
		const targetNode = pathway.pathway.find(v=>v.id === setRoute.target)
		if (!checkedNodes.get(targetNode)) checkedNodes.set(targetNode, setRoute)
		console.log(targetNode)
		if (targetNode.process === 'balance') {
			
		}
	}

	for (const fNode of factoryNodes) {
		fNode.node.route.forEach((v, i)=>{
			const setRoute = structuredClone(v)
			setRoute.item = structuredClone(fNode.factory.factory.outputs[i])
			routeTo(setRoute)
		})
	}

	console.log(checkedNodes)
}

calculate(pathway, [{
	id:'crack',
	factory:new Factory([{id:'oil',amount:1}], [{id:'oil',amount:1.5}])
}])

