



class Factory {
	constructor(inputs=[], outputs=[]) {
		if (!Array.isArray(inputs) && Array.isArray(outputs)) {
			throw new Error("Invalid parameters");
		}
		if (!(inputs.every(element=>element instanceof ItemInstance))) {
			throw new Error("Invalid parameters");
		}
		if (!(outputs.every(element=>element instanceof ItemInstance))) {
			throw new Error("Invalid parameters");
		}
		this.inputs = inputs
		this.outputs = outputs
	}

	mergeFactory(itemRecipe){
		if (!(itemRecipe instanceof Factory)) {
			throw new Error("Invalid parameters");
		}

		function concatUnique(array1, array2) {
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

		const newItemRecipe = new Factory(concatUnique(this.inputs, itemRecipe.inputs), concatUnique(this.outputs, itemRecipe.outputs));
		console.log(newItemRecipe)
		return newItemRecipe
	}

	resolveLoop(){
		this.outputs.forEach((output, index) => {
			const matchingInput = this.inputs.filter(e=>e.itemClass===output.itemClass)[0]
			console.log(output.name,output.quantity,matchingInput)
			if (!matchingInput) {
				return
			}
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
	constructor(name, id=0) {
		if (typeof name !== 'string') {
			throw new Error("Invalid parameters");
		}
		if (typeof id !== 'number') {
			throw new Error("Invalid parameters");
		}
		this.name = name
		this.id = id
	}
}




class ItemInstance {
	constructor(itemClass, quantity=0) {
		if (!(itemClass instanceof Item)) {
			throw new Error("Invalid parameters");
		}
		if (typeof quantity !== 'number') {
			throw new Error("Invalid parameters");
		}
		this.itemClass = itemClass
		this.name = itemClass.name
		this.quantity = quantity
	}

	clone(){
		return new ItemInstance(this.itemClass, this.quantity)
	}

	merge(itemInstance){
		if (!(itemInstance instanceof ItemInstance)) {
			throw new Error("Invalid parameter");
		}
		if (itemInstance.itemClass !== this.itemClass) {
			return
		}
		this.quantity += itemInstance.quantity
		itemInstance.quantity = 0
		return this
	}

	mergeClone(itemInstance){
		if (!(itemInstance instanceof ItemInstance)) {
			throw new Error("Invalid parameter");
		}
		if (itemInstance.itemClass !== this.itemClass) {
			return
		}
		return new ItemInstance(this.itemClass, this.quantity + itemInstance.quantity);
	}
}



//Item presets
const stick = new Item('Stick',0);
const stone = new Item('Stone',1);
const sand = new Item('Sand',2);
const dust = new Item('Dust',3);


//ItemProcesses presets
const crushStone = new Factory([new ItemInstance(stone, 1)],[new ItemInstance(sand, 2)]);
const crushSand = new Factory([new ItemInstance(sand, 1)],[new ItemInstance(dust, 1)]);

crushSand.mergeRecipe(crushStone).resolveLoop()

