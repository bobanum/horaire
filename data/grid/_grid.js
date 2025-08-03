export default class Grid {
	static label = null;
	static days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
	static startTime = 480;
	static slotDuration = 60;
	static breakDuration = 0;
	static slotCount = 10;
	static theme = "standard";
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
