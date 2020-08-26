function create(learningItems, columnTitles){
	var colWidths = [];
	try {
		columnTitles
	} catch(e) { columnTitles = []; }

	function objKeys(obj) {
		var keys = [];
		for (el in obj) {
			keys.push(el.Name);
		}

		return keys;
	}

	function columnNameByIndex (d){
		var colName = '';
		while (d > 0) {
			m = (d - 1) % 26;
			colName = String.fromCharCode(65 + m) + colName;
			d = Int((d - m) / 26)
		}
		return colName;
	}

	function setMaxColWith(value, index){
		var count = StrCharCount(value);
		var c = 0;
		try {
			c = colWidths[index];
		} catch(e) {}

		colWidths[index] = count > c ? count : c;
	}


	var path = UrlToFilePath(ObtainTempFile('.xlsx'));
	var oExcelDoc = new ActiveXObject('Websoft.Office.Excel.Document');
	oExcelDoc.CreateWorkBook();
	var oWorksheet = oExcelDoc.GetWorksheet(0);
	var rindex = 1;

	for (i = 0; i < columnTitles.length; i++) {
		cidx = columnNameByIndex((i + 1));
		oCell = oWorksheet.Cells.GetCell(cidx + rindex);
		oCell.Value = columnTitles[i];
		oCell.Style.ForegroundColor = '#CCCCCC';
		oCell.Style.VerticalAlignment = 'Center';
		oCell.Style.IsBold = true;
		setMaxColWith(oCell.Value, i);
	}

	rindex = rindex + 1;

	for(el in learningItems){

		ekeys = objKeys(el);
		for (i = 0; i < ekeys.length; i++) {
			if (ekeys[i] == 'structure') {
				continue;
			}

			cidx = columnNameByIndex((i + 1));
			oCell = oWorksheet.Cells.GetCell(cidx + rindex);
			oCell.Value = String(el.OptChild(ekeys[i]));
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, i); 
		}

		structure = el.GetOptProperty('structure');
		if (structure != undefined) {
			structureDivider = String(structure).split(' / ');
			idx = i;
			for (i = 0; i < structureDivider.length; i++) {
				cidx = columnNameByIndex(idx) + rindex;
				oCell = oWorksheet.Cells.GetCell(cidx);
				oCell.Value = structureDivider[i]; 
				oCell.Style.FontColor = '#444444';
				setMaxColWith(oCell.Value, idx);
				idx = idx + 1;
			}
		}

		rindex = rindex + 1;
	}

	for (i = 0; i < colWidths.length; i++){
		oWorksheet.Cells.SetColumnWidth(i, colWidths[i]);
	}

	oWorksheet.Cells.SetRowHeight(2, 30.0);
	oExcelDoc.SaveAs(path);
	return path;
}