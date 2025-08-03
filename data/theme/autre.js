import { ParentTheme } from './_theme.js';
export default class Theme extends ParentTheme {
	static label = "Autre";
	static css = {
		"": "font-family:papyrus;",
		"*": "line-height: 1;",
		"div.caption": "font-size:2em;border-radius: .3em;",
		"div.grille": "border-radius: .5em;background-color:black;padding: .2em; grid-gap:.1em .2em;",
		"div.jour": "background-color:black;color:white;",
		"div.heure": "background-color:#CCC;",
		".case": "border-radius: .3em;"
	};
	static slotTypes = [
		{
			css: "background-color:white;color:black"
		},
		{
			css: "background-color:fuchsia;color:#A52929"
		},
		{
			css: "background-color:darkgreen;color:white"
		},
		{
			css: "background-color:pink;color:darkblue"
		},
		{
			css: "background-color:#ddd;color:#ccc"
		}
	];
}
