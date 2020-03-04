function create(learningItems){
	var colWidths = [];

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
	var	rindex = 1;

	oCell = oWorksheet.Cells.GetCell('A' + rindex);
	oCell.Value = '���';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('B' + rindex);
	oCell.Value = '�������������';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('C' + rindex);
	oCell.Value = '���������';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('D' + rindex);
	oCell.Value = '��������';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('E' + rindex);
	oCell.Value = '���� ������';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('F' + rindex);
	oCell.Value = '���� ���������� ���������';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('G' + rindex);
	oCell.Value = '���� ������������ ����������';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('H' + rindex);
	oCell.Value = '������� ����������';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('I' + rindex);
	oCell.Value = '������';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('J' + rindex);
	oCell.Value = '����������� � �����������';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);



	oCell = oWorksheet.Cells.GetCell('K' + rindex);
	oCell.Value = '�������������_1';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('L' + rindex);
	oCell.Value = '�������������_2';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('M' + rindex);
	oCell.Value = '�������������_3';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('N' + rindex);
	oCell.Value = '�������������_4';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('O' + rindex);
	oCell.Value = '�������������_5';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('P' + rindex);
	oCell.Value = '�������������_6';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	oCell = oWorksheet.Cells.GetCell('Q' + rindex);
	oCell.Value = '�������������_7';
	oCell.Style.ForegroundColor = '#CCCCCC';
	oCell.Style.VerticalAlignment = 'Center';
	oCell.Style.IsBold = true;
	setMaxColWith(oCell.Value, 0);

	rindex = rindex + 1;

	for(el in learningItems){
		oCell = oWorksheet.Cells.GetCell('A' + rindex);
		oCell.Value = String(el.person_fullname);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 0); 

		oCell = oWorksheet.Cells.GetCell('B' + rindex);
		oCell.Value = String(el.person_subdivision_name);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 1);

		oCell = oWorksheet.Cells.GetCell('C' + rindex);
		oCell.Value = String(el.person_position_name);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 2);

		oCell = oWorksheet.Cells.GetCell('D' + rindex);
		oCell.Value = String(el.learning_name);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 3); 

		oCell = oWorksheet.Cells.GetCell('E' + rindex);
		oCell.Value = String(el.start_usage_date);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 4);

		oCell = oWorksheet.Cells.GetCell('F' + rindex);
		oCell.Value = String(el.last_usage_date);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 5);

		oCell = oWorksheet.Cells.GetCell('G' + rindex);
		oCell.Value = String(el.max_end_date);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 6);


		oCell = oWorksheet.Cells.GetCell('H' + rindex);
		oCell.Value = String(el.percent_score);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 7);


		oCell = oWorksheet.Cells.GetCell('I' + rindex);
		oCell.Value = String(el.status);
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 8);

		oCell = oWorksheet.Cells.GetCell('J' + rindex);
		oCell.Value = String(el.passing_require) == '1' ? '��' : '���';
		oCell.Style.FontColor = '#444444';
		setMaxColWith(oCell.Value, 9);


		structureDivider = String(el.structure).split(' / ');
		idx = 10;
		for (i = 1; i < structureDivider.length; i++) {
			oCell = oWorksheet.Cells.GetCell(columnNameByIndex(idx + 1) + rindex);
			oCell.Value = structureDivider[i]; 
			oCell.Style.FontColor = '#444444';
			setMaxColWith(oCell.Value, idx);
			idx = idx + 1;
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