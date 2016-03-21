// code JS pour un memory

// Cette fonction shuffle permet de distribuer au hasard les cartes
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

var actives = []; // Tableau vide qui va rassembler les cartes "retournées"
var imagesIndexes = []; // Tableau vide qui va rassembler les images des cartes
var paires = []; // Tableau vide qui va sélectionner 8 paires, soit 16 images
var nbImages = 16;

// for(var i=0;i<nbImages;i++){ // Rajoute un zéro au début des images
// 	imagesIndexes.push( i < 10 ? "0" + i : i );
// }

imagesIndexes.push();

shuffle(imagesIndexes); 
console.log(imagesIndexes);


$(document).ready(function(){ 
	var body = $('body');
	
	// Cette boucle crée les cartes
	for(var i=0;i<nbImages;i++){ 
		var div = document.createElement('div');
		div.className += "mos";
		div.id = "mos"+ i;
		div.style.background = "url(\"../data/" + ,paire[i / 2] + "/" + imagesIndexes[i] + ".png\")";
		body.append(div);
	}


	// function selectPaires() {
	// 	shuffle(paires);
	// 	for(var i = 0; i < nbImages/2; i++){
	// 		div.id.
	// 	}
	// }
	var divs = $('div'); // On place ces cartes (div) dans une variables divs

	divs.on('click', function(){ // Évènement au clic
		if(! $(this).hasClass("active") && actives.length < 2){ // si moins de 2 images sont retournées
			$(this).toggleClass("active"); // on ajoute la classe active
			this.style.background = "url(\"../data/img-verso/" + this.id.substring(3,6) + ".png\")";

			actives = divs.filter(function(i, div){
				return $(div).hasClass("active");
			});

			console.log(actives.length);

			if( actives.length == 2 ){
				window.setTimeout( function(){
					$(actives[0]).toggleClass("active");
					$(actives[1]).toggleClass("active");

					actives[0].style.background = "url(\"../data/img-recto/" + imagesIndexes[parseInt(actives[0].id.substring(3,6))] + ".png\")";
					actives[1].style.background = "url(\"../data/img-recto/" + imagesIndexes[parseInt(actives[1].id.substring(3,6))] + ".png\")";

					actives = divs.filter(function(i, div){
						// console.log(div, $(div).hasClass("active"));
						return $(div).hasClass("active");
					});
				}, 2000 );
			}
		}
	});
});
