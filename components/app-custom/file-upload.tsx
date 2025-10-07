'use client'
import Dropzone, {DropzoneState} from "shadcn-dropzone";
import FileIcon from '@/assets/icons/register/FileIcon.svg'
import {Accept} from "react-dropzone";
import {useEffect, useRef, useState} from "react";

interface IFileUpload {
	multiple?: boolean,
	accept?: Accept
	onDrop?: (acceptedFile: File) => void
	value?: File
}

const imageTypes = ['.png', '.jpg', '.jpeg'];

export default function FileUpload(
		{
			multiple = false,
			accept = {
				'image/jpeg': [],
				'image/png': [],
				'image/jpg': []
			},
			onDrop,
			value
		}: IFileUpload
) {
	const [selectedFile, setSelectedFile] = useState<File | null>(value || null);


	useEffect(() => {
		setSelectedFile(value || null)
	}, [value])


	return (
			<Dropzone
					accept={accept}
					containerClassName={' bg-dashed-box rounded-[12px]'}
					dropZoneClassName={'!border-0 py-4 px-5 hover:!bg-inherit justify-normal'}
					multiple={multiple}
					showErrorMessage={true}
					onDrop={(acceptedFiles: File[]) => {
						const file = acceptedFiles[0];
						setSelectedFile(file);
						onDrop && onDrop(file);
					}}
			>
				{(dropzone: DropzoneState) => {
					return (
							(
									<>
										{
											!selectedFile ? (
													<div className={'flex items-center gap-x-4'}>
														<FileIcon />
														<div className={'flex flex-col gap-y-1'}>
															<h4 className={'text-dark-gray text-sm font-medium'}>Choose file or drag and drop</h4>
															<h5 className={'text-charcoal/50 text-xs font-medium'}>Accepted file formats: .png, .jpg, .jpeg</h5>
														</div>
													</div>
											) : (
													<div>
														{selectedFile.name}
													</div>
											)
										}
									</>
							)
					)
				}}
			</Dropzone>
	)
}
