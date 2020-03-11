import React, { Component } from 'react';
import { Upload, Button, Icon, message } from 'antd';
import { createBaseUrl } from '../../utils/request';
import './index.css';

class UploadFile extends Component {

	render() {
		const { url, data, onFileUploaded, disabled } = this.props;

		return (
			<div className='upload-file'>
				<Upload
					accept='.xls, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					name='file'
					action={url}
					data={data}
					disabled={disabled}
					showUploadList={{
						showDownloadIcon: false,
						showRemoveIcon: false
					}}
					onChange = {({ file }) => {
						if (file.response) {
							onFileUploaded(file.response.data);
						}
					}}
				>
					<Button className='learnings-upload-file'>
						<Icon type='upload' /> Загрузить файл
					</Button>
				</Upload>
			</div>
		);
	}
}

export default UploadFile;
