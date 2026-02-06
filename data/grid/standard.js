import ParentGrid from "./_grid.js";
export default class Grid extends ParentGrid {
	static label = "Semaine complète";
	static slotTypes = [
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
}
