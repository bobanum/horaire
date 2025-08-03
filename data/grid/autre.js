import ParentGrid from "./_grid.js";
export default class Grid extends ParentGrid {
	static label = "Autre";
	static days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
	static startTime = 480;
	static slotDuration = 50;
	static breakDuration = 10;
	static slotCount = 11;
	static theme = "standard";
	static slotTypes = [
		{
			label: "En cours"
		},
		{
			label: "Disponible"
		},
		{
			label: "Sur rendez-vous"
		},
		{
			label: "Non disponible"
		}
	]
};
