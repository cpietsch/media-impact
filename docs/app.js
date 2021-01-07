// dude, don't look at this code... you will burn your eyes and get blind for all the beauty in the world
// if somebody want to fix it, contact me on cpietsch@gmail.com


var db,massScale,impactScale,maxMass,barEnd;
var scale={};

jQuery(document).ready(function() {
	$('.description').hide();
	$(window).scroll(function() {
	   if($(window).scrollTop() + $(window).height() == $(document).height()) {
	       generateBar(barEnd);
	   }
	});
});


var init = function(){

	scale['flickr'] = d3.scale.sqrt()
    	.domain([0, d3.max(db, function(d) { return d.flickrCount; })])
    	.range([0, 100]);
    scale['google'] = d3.scale.sqrt()
    	.domain([0, d3.max(db, function(d) { return d.googleCount; })])
    	.range([0, 100]);
    scale['twitter'] = d3.scale.sqrt()
    	.domain([0, d3.max(db, function(d) { return d.twitterCount; })])
    	.range([0, 100]);
    scale['youtube'] = d3.scale.sqrt()
    	.domain([0, d3.max(db, function(d) { return d.youtubeCount; })])
    	.range([0, 100]);
    scale['bing'] = d3.scale.sqrt()
    	.domain([0, d3.max(db, function(d) { return d.bingCount; })])
    	.range([0, 100]);

    db.map(function(d){
    	//console.log(d);
    	d.impact = scale['bing'](d.bingCount)
    		+ scale['youtube'](d.youtubeCount)
    		+ scale['google'](d.googleCount)
    		+ scale['twitter'](d.twitterCount)
    		+ scale['flickr'](d.flickrCount);
    });

    db.sort(function(a,b) {return b.impact-a.impact;});

    scale['impact'] = d3.scale.sqrt()
    	.domain([0, d3.max(db, function(d) { return d.impact; })])
    	.range([0, 100]);
    scale['mass'] = d3.scale.sqrt()
    	.domain([0, d3.max(db, function(d) { return d.mass; })])
    	.range([0, 100]);

	maxMass = d3.max(db, function(d) { return d.mass; });
	massScale = d3.scale.sqrt()
    	.domain([0, maxMass])
    	.range([0, 60]);

    impactScale = d3.scale.sqrt()
    	.domain([0, d3.max(db, function(d) { return d.impact; })])
    	.range([0, 60]);

    $('#sortMass').click(function(){
		db.sort(function(a,b) {return b.mass-a.mass;});
		generateBar(0);
		$('#sort a.active').removeClass('active');
		$(this).addClass('active');
	});
	$('#sortImpact').click(function(){
		db.sort(function(a,b) {return b.impact-a.impact;});
		generateBar(0);
		$('#sort a.active').removeClass('active');
		$(this).addClass('active');
	});
	$('#sortYear').click(function(){
		db.sort(function(a,b) {return b.year-a.year;});
		generateBar(0);
		$('#sort a.active').removeClass('active');
		$(this).addClass('active');
	});

	generateBar(0);

}

// DUDE, I SAID: DONT LOOK AT THE CODE !!!!!!!!!!!!!!

var loadTwitter= function(name){
	//var div = $('<div>').appendTo('#content');
	$.getJSON('http://search.twitter.com/search.json?callback=?&include_entities=true',
		{
			rpp:100,
			q:"\""+name+" meteorite\""
		},
		function(data) {
			console.log(data);
			$.each(data.results, function(key, val) {
				var html = "";
				html += "<b>"+val.from_user+"</b>: "+val.text;
				html += ' <a href="http://twitter.com/'+val.from_user+'/status/'+val.id_str+'">twitter</a>';
				$('<div>').addClass('twitter').html(html).appendTo('#content');
			});
	});
}

var loadYoutube= function(name){
	//var div = $('<div>').appendTo('#content');
	$.getJSON('http://gdata.youtube.com/feeds/api/videos?callback=?',
		{
			alt:'json',
			q:"\""+name+" meteorite\""
		},
		function(data) {
			console.log(data);
			$.each(data.feed.entry, function(key, val) {
				//val.id['$t'].split('os/')[1]
				var html = '';
				html += '<b>'+val.title.$t +'</b>: '+ val.content.$t.substr(50);
				html += ' <a target="_blank"  href="'+val.link[0].href+'">youtube</a>';
				$('<div>').addClass('youtube').html(html).appendTo('#content');
			});
	});
}

var loadFlickr= function(name){
	//var div = $('<div>').appendTo('#content');
	$.getJSON('http://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=517d611f956d8a449d545f78c551cd51&safe_search=1&per_page=20&nojsoncallback=1&format=json',
		{
			text:"\""+name+" meteorite\""
		},
		function(data) {
			console.log(data);
			$.each(data.photos.photo, function(i,item){
			        var src = '<a target="_blank" href="http://www.flickr.com/photos/'+item.owner+'/'+item.id+'"><img src="http://farm'+ item.farm +'.static.flickr.com/'+ item.server +'/'+ item.id +"_"+ item.secret +'_m.jpg"></a>';
			       $('<div>').addClass('flickr').html(src).appendTo('#content');

			});
	});
}



var generateBar = function(from){
	if(from==0) $('#barContainter').empty();

	barEnd = from+600;
	if(db && db.length && barEnd>db.length) to = db.length;
    for (var i = from; i < barEnd; i++) {
    	var elem = db[i];
		var row  = $('<div>')
			.appendTo('#barContainter')
			.data({id:i})
			.on("click",function(){
				window.scrollTo(0,0);
				$('.title').fadeOut();
				$('#barContainter .active').removeClass('active');
				$(this).addClass('active');
				$('#content').empty();

				var d = db[$(this).data('id')];

				//console.log(d.text)
				if(d.text!=""){
					var link = ' <a target="_blank" href="http://lpi.usra.edu/meteor/metbull.php?code='+d.idx+'">source</a>';
					$('<div>').addClass('text').html(d.text+link).appendTo('#content');
				}
				
				loadFlickr(d.name);
				loadTwitter(d.name);
				loadYoutube(d.name);
				

				mapTo([d.reclat,d.reclong],scale['mass'](d.mass)/33,scale['impact'](d.impact)/33);	
			
				var container = $('#left .description');
				var tmp;

				if(container.find('h1').text()!="Meteorite"){
					tmp = container.html();
				}
				
				container
					.fadeIn()
					.find('h1').text(d.name).end()
					.find('.year').text(d.year).end()
					.find('.place').text(d.name).end()
					.find('.mass').text(d.mass).end()
					.find('.impact').text(scale['impact'](d.impact).toFixed(2)+"%").end()
					.find('.youtube').text(d.youtubeCount).end()
					.find('.twitter').text(d.twitterCount).end()
					.find('.flickr').text(d.flickrCount).end()
					.find('.google').text(d.googleCount).end()
					.find('.bing').text(d.bingCount).end()
					.find('.found').text(d.fall=="Fell"?"fallen":"found").end()

				var d = [
				          [
				           {axis: "Flickr", value: scale['flickr'](d.flickrCount)}, 
				           {axis: "Twitter", value: scale['twitter'](d.twitterCount)}, 
				           {axis: "Youtube", value: scale['youtube'](d.youtubeCount)},  
				           {axis: "Google", value: scale['google'](d.googleCount)},  
				           {axis: "Bing", value: scale['bing'](d.bingCount)}
				          ],
				        ];
				RadarChart.draw("#left .chart", d);

				if(tmp){
					$('<div>')
					.addClass('description')
					.html(tmp)
					.prependTo('#history')
					.css({cursor:'pointer'})
					.click(function(){
						$(this).remove();
					})
				}
				
				
				$('#barContainter>div:gt(600)').remove();
				$('#history>div:gt(5)').remove();
			});

		var outerMass = $('<div>').appendTo(row).addClass('mass');
		$('<span>').text(elem.name).appendTo(outerMass);
		var innerMass = $('<div>')
			.css({
				width:massScale(elem.mass)+"%"
			})
			.appendTo(outerMass);

		var outerImpact = $('<div>').appendTo(row).addClass('impact');
		$('<span>').text(elem.year).appendTo(outerImpact);
		var innerMass = $('<div>')
			.css({
				width:impactScale(elem.impact)+"%"
			})
			.appendTo(outerImpact);
	}

}

function toNamed(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[arr[i].name] = arr[i];
  return rv;
}

d3.csv("data/fullData.csv", function(d) {

	d.mass=d.mass*1;
	d.youtubeCount=d.youtubeCount*1;
	d.twitterCount=d.twitterCount*1;
	d.flickrCount=d.flickrCount*1;
	d.bingCount=d.bingCount*1;
	d.googleCount=d.googleCount*1;

	d.impact = 0;

	return d;

}, function(csv){
	//console.log(csv);

	//var map = toNamed(csv);

	db = csv;

	init();
});