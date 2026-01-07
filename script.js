

/**
 * return the sum of every number in array
 * @param {number[]} n 
 * @returns {number}
 */
function sum(n) {
	let s = 0
	for (const x of n) {
		s += x
	}
	return s
}




class Fraction {
	static from(value){
		if (typeof value === 'number') {
			return new Fraction(value, 1)
		} else if (value instanceof Fraction) {
			return new Fraction(value.num, value.den)
		}
		return new Fraction()
	}

	static sum(fractions){
		if (fractions.length === 0) {
			return new Fraction()
		}
		const s = new Fraction()
		for (const f of fractions) {
			s.add(f)
		}
		return s
	}

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

	greaterThan(value){
		const other = Fraction.from(value)
		const thisS  = this.num * other.den
		const otherS = other.num * this.den
		return thisS > otherS
	}

	lessThan(value){
		const other = Fraction.from(value)
		const thisS  = this.num * other.den
		const otherS = other.num * this.den
		return thisS < otherS
	}

	toStr(){
		return `${this.num}/${this.den}`
	}
}



class Item {
	static from(item){
		if (!(item instanceof Item)) throw new Error("Could not clone Item");
		return new Item(item.id, item.amount)
	}

	/**
	 * @param {string} id 
	 * @param {number|Fraction} amount 
	 */
	constructor(id, amount) {
		/**@type {string} */
		this.id = id
		/**@type {Fraction} */
		this.amount = typeof amount === 'number'? new Fraction(amount, 1) : amount
	}
}



class Factory {
	constructor(id, time, inputs=[], outputs=[]) {

		/**@type {string} */
		this.id = id

		/**@type {Fraction} */
		this.time = time

		/**@type {Item[]} */
		this.inputs = inputs
		
		/**@type {Item[]} */
		this.outputs = outputs

		/**@type {boolean} */
		this.strict = false

		/**@type {Fraction} */
		this.util = new Fraction(1,1)
	}
}



/**
 * @typedef {{target:string, slot:number, weight?:number}[][]} Route
 */
/**
 * @typedef {object} PathwayNode
 * @property {string} id 
 * @property {string} process 
 * @property {object} [parameters] 
 * @property {Route} route 
 */
/**
 * @typedef {object} Pathway
 * @property {{inputItemsId:string[], route:Route}} input
 * @property {PathwayNode[]} nodes 
 */



// Factory pathway
const pathway = {
	input:{
		inputItemsId:['stone', 'sand', 'clay'],
		route:[[
			{target:'crush1', slot:0},
		]]
	},
	nodes:[
		{
			id:'crush1',
			process:'crush',
			parameters:{util:'1', strict:true},
			route:[[
				{target:'output', slot:0},
			]]
		}
	]
}

const pathway2 = {
	input:{
		inputItemsId:['coal', 'gravel'],
		route:[[
			{target:'smelt', slot:1},
		],[
			{target:'smelt', slot:0},
		]]
	},
	nodes:[
		{
			id:'smelt',
			process:'smelt',
			route:[[
				{target:'output', slot:0},
			]]
		}
	]
}

const pathway3 = {
	input:{
		inputItemsId:['water'],
		route:[[
			{target:'greenhouse', slot:0}
		]]
	},
	nodes:[
		{
			id:'greenhouse',
			process:'greenhouse',
			route:
			[
				[
					{target:'sawmill', slot:0, weight:2},
					{target:'pyro', slot:0, weight:1}
				],
				[
					{target:'compost', slot:0}
				]
			]
		},
		{
			id:'sawmill',
			process:'sawmill',
			route:[[{target:'output', slot:0}]]
		},
		{
			id:'pyro',
			process:'pyrolysis_oven',
			route:[[{target:'output', slot:1}]]
		},
		{
			id:'compost',
			process:'compost_barrel',
			route:[[
				{target:'output',     slot:2, weight:9},
				{target:'greenhouse', slot:1, weight:1}
			]]
		},
	]
}





/**
 * Validate that every node get enough resources
 * @param {Pathway} pathway 
 * @param {Factory[]} factories 
 * @returns 
 */
function calculate(pathway, factories) {
	const errors = []

	const inputReceivingNodes = pathway.nodes.filter(node=>{
		const f = factories.find(f=>f.id === node.process)
		if (!f) return false
		for (let so = 0; so < pathway.input.route.length; so++) {
			for (const route of pathway.input.route[so]) {
				if (node.id === route.target) return true
			}
		}
		return false
	}).map(n=>n.id)
	/** @type {Fraction[]} */
	const pathwayInputAmounts = pathway.input.inputItemsId.map(()=>new Fraction())

	console.log('inputReceivingNodes', inputReceivingNodes)
	
	for (const node of pathway.nodes) {
		
		const factory = factories.find(f=>f.id === node.process)
		if (!factory) {
			errors.push(`Factory '${node.process}' not found`)
			continue
		}
		
		const upstream = pathway.nodes.filter(n=>
			n.route.some(r=>
				r.some(t=>
					t.target === node.id
				)
			)
		)

		/**           slot  , incoming items
		 * @type {Map<number, Item[]>} */
		const incoming = new Map()

		for (const up of upstream) {
			const upFactory = factories.find(f=>f.id === up.process)
			if (!upFactory) continue

			for (let so = 0; so < up.route.length; so++) {
				const routeOut = up.route[so];
				const weights = routeOut.map(r=>r.weight?r.weight:1)
				for (const route of routeOut) {
					if (route.target !== node.id) continue
					const item = Item.from(upFactory.outputs[so])
					item.amount.divide(upFactory.time)
					item.amount.multiply(new Fraction(route.weight?route.weight:1,sum(weights)))
					if (incoming.get(route.slot)) {
						incoming.get(route.slot).push(item)
					} else {
						incoming.set(route.slot, [item])
					}
				}
			}
		}

		console.log('node',node.id,'incoming',incoming)

		for (let slot = 0; slot < factory.inputs.length; slot++) {
			const input = factory.inputs[slot];
			const slotFlow = incoming.get(slot)
			const inAmount = Fraction.from(input.amount).divide(factory.time)
			const slotFlowSum = slotFlow ? Fraction.sum(slotFlow.map(sf=>sf.amount)) : new Fraction()

			if (inputReceivingNodes.includes(node.id)) {

				console.log('true')
				const routedToThisSlot = pathway.input.route.map(r=>r.filter(r=>r.slot===slot && r.target===node.id))
				console.log('routedToThisSlot', routedToThisSlot)
				if (routedToThisSlot.some((v,i)=>pathway.input.inputItemsId[i] !== input.id && v.length > 0)) {
					errors.push(`Node '${node.id}' is receiving incorrect item '${routedToThisSlot.map((v,i)=>pathway.input.inputItemsId[i]).filter(v=>v !== input.id)}' from pathway input for slot '${slot}'`)
					continue
				}
				let amountToAdd
				if (slotFlow) {
					amountToAdd = Fraction.from(inAmount).subtract(slotFlowSum)
				} else {
					amountToAdd = Fraction.from(inAmount)
				}
				for (let i = 0; i < routedToThisSlot.length; i++) {
					const r = routedToThisSlot[i]
					if (r.length > 0) pathwayInputAmounts[i].add(Fraction.from(amountToAdd).divide(r.length))
				}

			} else {

				console.log('false')
				if (!slotFlow) {
					errors.push(`Node '${node.id}' is missing inputs for slot'${slot}'`)
					continue
				}
				if (slotFlow.some(sf=>sf.id !== input.id)) {
					errors.push(`Node '${node.id}' is receiving incorrect items '${slotFlow.filter(sf=>sf.id !== input.id).map(sf=>sf.id).join(', ')}' for slot'${slot}'`)
				}
				if (slotFlowSum.lessThan(inAmount)) {
					errors.push(`Node '${node.id}' is receiving insufficient items '${slotFlowSum.toStr()}' for slot'${slot}'`)
				}

			}

		}
	}
	console.log('pathwayInputAmounts', pathwayInputAmounts.map(f=>f.toStr()))
	return {errors, pathwayInputAmounts}
}


console.log('errors',...Object.values(calculate(pathway2, [
	new Factory('crush', 1, [new Item('stone', 1)], [new Item('gravel', 1)]),
	new Factory('smelt', 1, [new Item('gravel', 1), new Item('coal', 1)], [new Item('stone', 1)])
])))
