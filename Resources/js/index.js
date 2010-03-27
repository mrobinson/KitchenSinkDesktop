KitchenSink = {};
KitchenSink.topics = {}
KitchenSink.topicNames = []

function Topic(doc)
{
	this.name = doc.documentElement.attributes['name'].value;
	this.doc = doc;
	this.sections = [];

	this.html = ''
	var iterator = this.doc.evaluate(".//div[@class='section']", this.doc, null,
		 XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
	thisNode = iterator.iterateNext();
	while (thisNode)
	{
		var sectionName = thisNode.attributes['name'].value;
		var anchorName = sectionName.replace(/ /g, "_");
		this.sections.push([sectionName, anchorName]);

		this.html += '<h2 id="' + anchorName + '">' + sectionName + '</h2>';
		this.html += '<div class="section">';
		this.html += new XMLSerializer().serializeToString(thisNode);
		this.html += '</div>';
		thisNode = iterator.iterateNext();
	}
}

KitchenSink.registerTopic = function(topicFile)
{
	try
	{
		var doc = (new DOMParser()).parseFromString(
			topicFile.read().toString(), "text/xml");
		if (doc === null)
			return;
		var topic = new Topic(doc);
	}
	catch (exception)
	{
		// Failed to parse the XML, bail out.
		console.log(exception);
		return;
	}

	KitchenSink.topics[topic.name] = topic;
	KitchenSink.topicNames.push(topic.name);
};

KitchenSink.loadTopic = function(topic)
{
	KitchenSink.activeTopic = topic;
	$('#api_heading').html(topic.name);
	$('#api_content').css('opacity','0');
	$('#api_content').get(0).scrollTop = 0;
	$('#api_content').html(KitchenSink.activeTopic.html);

	var i = 0;
	KitchenSink.code = [];
	$('.api_code').each(function()
	{
		try
		{
			KitchenSink.code.push(new Function(
				this.children[0].innerText));
			$(this).after('<button onclick="KitchenSink.code[' + i
				+ ']();">Run Example</button><br/>');
		}
		catch (exception)
		{
			alert("Paser error (line: " + exception.line + "): "
				 + this.children[0].innerText);
		}
		i++;
	});

	$.beautyOfCode.init({
		brushes: ["JScript"],
		ready: function()
		{
			$(".api_code,.syntax").beautifyCode(
				"javascript", {gutter: false});
		}
	});

	$('#api_content').fadeTo(200, '1.0');
	Titanium.UI.currentWindow.setTitle("Desktop KitchenSink: " +
		KitchenSink.activeTopic.name);
}

// Load all JS files for examples
KitchenSink.loadResourceFiles = function()
{
	var examplesDir = Titanium.Filesystem.getFile(
		Titanium.API.application.getResourcesPath(), 'topics');
	var exampleFiles = examplesDir.getDirectoryListing();

	for (var i = 0; i < exampleFiles.length; i++)
	{
		if (exampleFiles[i].isFile())
		{
			KitchenSink.registerTopic(exampleFiles[i]);
		}
	}

	var getSectionListHTML = function(topic, topicId)
	{
		return html;
	}

	KitchenSink.topicNames.sort();
	var html = '';
	for (var i = 0; i < KitchenSink.topicNames.length; i++)
	{
		// Add the topic item.
		var topicId = "topic_" + i;
		var topic = KitchenSink.topics[KitchenSink.topicNames[i]];
		html += '<div class="topic_list" id="';
		html += topicId;
		html += '">' + topic.name + "</div>";

		// Add the section items.
		html += '<div class="section_list"'
			+ ' id="section_list_' + topicId + '">';
		for (var j = 0; j < topic.sections.length; j++)
		{
			html += '<div class="section_item" name="' + topic.sections[j][1] + '">';
			html += topic.sections[j][0];
			html += '</div>';
		}
		html += '</div>';
	}
	$('#api_list').html(html);

	var loadTopicByElement = function(topicElement)
	{
		$('.topic_list').removeClass('active');
		$('.section_list').hide();
		$(topicElement).addClass('active');
		$('#section_list_' + topicElement.id).show();
		KitchenSink.loadTopic(KitchenSink.topics[topicElement.innerHTML]);
	}

	loadTopicByElement(document.getElementById("topic_0"));
	$('.topic_list').click(function()
	{
		loadTopicByElement(this);
	});
	$('.section_item').click(function()
	{
		var content = $('#api_content');
		var target = $('#' + this.attributes['name'].value);
		content.scrollTop(
			target.offset().top // The offset of the div within the page
			 - content.offset().top +  // The offset of the content area within the page
			content.scrollTop()); // The amount of scrolled area above the "viewport"
	});
};

window.onload = function()
{
	$(function()
	{
		function resizeContentDiv()
		{
			var height = window.innerHeight - 50;
			document.getElementById('api_content').style.height = height;
			document.getElementById('api_list').style.height = height;
		}
		resizeContentDiv();
		Titanium.UI.currentWindow.addEventListener(Titanium.RESIZED, resizeContentDiv);
	});
	KitchenSink.loadResourceFiles();
};


