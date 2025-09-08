



class Factory {
	constructor(inputs=[], outputs=[]) {
		if (!Array.isArray(inputs) && Array.isArray(outputs)) throw new Error("Invalid parameters");
		if (!(inputs.every(element=>element instanceof ItemInstance))) throw new Error("Invalid parameters");
		if (!(outputs.every(element=>element instanceof ItemInstance))) throw new Error("Invalid parameters");
		this.inputs = inputs
		this.outputs = outputs
	}

	mergeFactory(itemRecipe){
		if (!(itemRecipe instanceof Factory)) throw new Error("Invalid parameters");
		const newItemRecipe = new Factory(concatUnique(this.inputs, itemRecipe.inputs), concatUnique(this.outputs, itemRecipe.outputs));
		console.log(newItemRecipe)
		return newItemRecipe
	}

	resolveLoop(){
		this.outputs.forEach((output, index) => {
			const matchingInput = this.inputs.filter(e=>e.itemClass===output.itemClass)[0]
			console.log(output.name,output.quantity,matchingInput)
			if (!matchingInput) return
			output.quantity -= Math.max(output.quantity, matchingInput.quantity)
		});
		this.removeZero()
		console.log(this)
	}

	removeZero(){
		this.inputs = this.inputs.filter(element=>element.quantity !== 0)
		this.outputs = this.outputs.filter(element=>element.quantity !== 0)
	}
}




class Item {
	#name
	#tags
	constructor(name, tags=[]) {
		if (typeof name !== 'string') throw new Error("Invalid parameters");
		if (!(Array.isArray(tags))) throw new Error("Invalid tags");
		this.#name = name
		this.#tags = Array.from(tags)
	}

	getName(){
		return String.apply(this.#name)
	}

	getTags(){
		return Array.from(this.#tags)
	}

	createInstance(quantity=0){
		return new ItemInstance(this, quantity)
	}
}




class ItemInstance {
	constructor(itemClass, quantity=0) {
		if (!(itemClass instanceof Item)) throw new Error("Invalid parameters");
		if (typeof quantity !== 'number') throw new Error("Invalid parameters");
		this.itemClass = itemClass
		this.getName = itemClass.getName
		this.quantity = quantity
	}

	clone(){
		return new ItemInstance(this.itemClass, this.quantity)
	}

	merge(itemInstance){
		if (!(itemInstance instanceof ItemInstance)) throw new Error("Invalid parameter");
		if (itemInstance.itemClass !== this.itemClass) return
		this.quantity += itemInstance.quantity
		itemInstance.quantity = 0
		return this
	}

	mergeClone(itemInstance){
		if (!(itemInstance instanceof ItemInstance)) throw new Error("Invalid parameter");
		if (itemInstance.itemClass !== this.itemClass) return
		return new ItemInstance(this.itemClass, this.quantity + itemInstance.quantity);
	}
}




function concatUnique(array1, array2) {
	// [1,2,3,4] + [1,3,4,8,9] = [1,2,3,4,8,9]
	const newArray = []
	for (let i = 0; i < Math.max(array1.length, array2.length); i++) {
		const element1 = array1[i];
		const element2 = array2[i];
		if (element1.itemClass === element2.itemClass) {
			newArray.push(element1.mergeClone(element2))
		}
		if (element1) {
			newArray.push(element1.clone())
		}
		if (element2) {
			newArray.push(element2.clone())
		}
	}
	return newArray
}




//Item presets
const stick = new Item('Stick');
const stone = new Item('Stone');
const sand = new Item('Sand');
const dust = new Item('Dust');


//ItemProcesses presets
const crushStone =  new Factory([stone.createInstance(1)],[sand.createInstance(2)])
const crushSand = new Factory([sand.createInstance(1)],[dust.createInstance(1)])

// Factory pathway
const output = {}
const split = [{quantity:1, target:crushSand}, {quantity:1, target:output}]
const node1 = {factory:crushStone, targets:[split]}
const node2 = {factory:crushSand, targets:[output]}
console.log([node1, node2, split, output])


