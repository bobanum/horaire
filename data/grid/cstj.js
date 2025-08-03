import ParentGrid from "./_grid.js";
export default class Grid extends ParentGrid {
	static label = "Cégep de Saint-Jérôme";
	static days = this.days.slice(1, -1); // Exclude Sunday and Saturday
	static startTime = 480;
	static slotDuration = 50;
	static breakDuration = 5;
	static slotCount = 11;
	static theme = "standard";
	static fields = {
		local: {
			label: "Local",
			type: "text"
		}
	};
	
	static slotTypes = [
		{
			label: "En cours",
			fields: Object.assign({}, this.fields, {
				cours: {
					label: "Cours",
					type: "text"
				},
				groupe: {
					label: "Groupe",
					type: "text"
				}
			})
		},
		{
			label: "Disponible",
			fields: Object.create(this.fields)
		},
		{
			label: "Sur rendez-vous",
			fields: Object.create(this.fields)
		},
		{
			label: "Non disponible",
			fields: {}
		}
	]
};

// Grid.days = ParentGrid.days.slice(1, -1);