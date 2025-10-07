"use client"

import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table"

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import {cn} from "@/lib/utils";

/**
 * CustomDataTable is a reusable table component built with TanStack Table (React Table v8).
 * It provides a customizable data grid with header and body sections.
 *
 * @template TData - The type of data being displayed in the table
 * @template TValue - The type of values in the table cells
 *
 * @component
 * @example
 * ```tsx
 * const columns = [
 *   { accessorKey: 'name', header: 'Name' },
 *   { accessorKey: 'age', header: 'Age' }
 * ];
 *
 * const data = [
 *   { name: 'John', age: 25 },
 *   { name: 'Jane', age: 30 }
 * ];
 *
 * <CustomDataTable columns={columns} data={data} />
 * ```
 */

/**
 * Props interface for the CustomDataTable component
 * @interface DataTableProps
 * @template TData - The type of data being displayed
 * @template TValue - The type of values in the cells
 * @property {ColumnDef<TData, TValue>[]} columns - Array of column definitions
 * @property {TData[]} data - Array of data items to display in the table
 */

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
}

export function CustomDataTable<TData, TValue>({
																					 columns,
																					 data,
																				 }: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	})


	const rowsLength = table.getRowModel().rows.length;
	// divClassname={'scrollbar scrollbar-thumb-sky-700 scrollbar-track-sky-300'}
	return (
			<div className="!rounded-3xl border overflow-hidden">
				<Table className={'!rounded-3xl overflow-hidden w-[1160px]'} divClassname={'scrollbar scrollbar-thin scrollbar-thumb-border scrollbar-track-gray-200 scrollbar-thumb-rounded-full'}>
					<TableHeader className={'bg-light-gray !rounded-t-3xl '}>
						{table.getHeaderGroups().map((headerGroup) => (
								<TableRow className={'bg-light-gray hover:bg-light-gray !rounded-t-3xl'} key={headerGroup.id}>
									{headerGroup.headers.map((header, index) => {
										return (
												<TableHead className={cn('py-2 px-6 text-misty-gray text-xs font-medium', index === 0 && 'rounded-tl-3xl' , index === headerGroup.headers.length - 1 && 'rounded-tr-3xl')} key={header.id}>
													{header.isPlaceholder
															? null
															: flexRender(
																	header.column.columnDef.header,
																	header.getContext()
															)}
												</TableHead>
										)
									})}
								</TableRow>
						))}
					</TableHeader>
					<TableBody className={'!rounded-b-3xl'}>
						{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map((row, i) => (
										<TableRow
												className={cn('bg-white hover:bg-steel-blue/5', i === rowsLength - 1 && '!rounded-b-3xl')}
												key={row.id}
												data-state={row.getIsSelected() && "selected"}
										>
											{row.getVisibleCells().map((cell, j) => (
													<TableCell className={cn('p-6 max-w-[15ch]', i === rowsLength - 1 && j === 0 && 'rounded-bl-3xl' , i === rowsLength - 1 && j === row.getVisibleCells().length - 1 && 'rounded-br-3xl')} key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
											))}
										</TableRow>
								))
						) : (
								<TableRow>
									<TableCell colSpan={columns.length} className="h-24 text-center">
										No results.
									</TableCell>
								</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

	)
}
