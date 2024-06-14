class ChapterLessons {
    getLessonTasks(dv) {               // <=====
		let chapter = dv.current()   // <=====
        
		//Create a table with all notes linked from "chapter" which are in the folder "lessons".
		var lessonfolder = "_RMKA/lessons"; 
		// all outgoing notes
		const olessons = 
			// all outgoing notes		
			chapter.file.outlinks
		   	// only those below the lession folder
			.filter(f => f.path.startsWith(lessonfolder))
			// create a page object from the link object
			.map(f => dv.page(f));
		for (let i = 0; i < olessons.length; i++) {
			let lesson = olessons[i]
			let tasks_total = lesson.file.tasks.length
			let tasks_open =  lesson.file.tasks.where(t => !t.completed).length
			let lesson_number = i + 1
			dv.header(3, "📖 " + lesson_number + ". " + lesson.file.name)
			dv.paragraph(" (" + (tasks_total - tasks_open) + " von " + tasks_total + " erledigt)")
			dv.taskList(lesson.file.tasks, false);
		}	
    }
}