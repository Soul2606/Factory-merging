



// Factory pathway
const pathway = {
	input:[
		[{target:'crack', id:'stone', slot:0}]
	],
	pathway:[
		{
			id:'crack',
			process:'crack',
			parameters:{util:'1', strict:true},
			route:[{target:'split1', slot:0}]
		},
		{
			id:'split1',
			process:'split',
			parameters:{weights:[2,1]},
			route:[
				{target:'output', slot:0}, 
				{target:'crack', slot:1}
			]
		}
	]
}


