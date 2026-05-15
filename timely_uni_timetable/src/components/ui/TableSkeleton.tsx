import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";

const TableSkeleton = () =>
{
    return (
        <div className="animate-pulse">
            <Table className="border-separate border-spacing-y-2">
                <TableHeader>
                    <TableRow>
                        <TableHead>S/N</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Created On</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, index) => (
                        <TableRow key={index} className="bg-gray-100">
                            <TableCell>
                                <div className="h-4 bg-gray-300 rounded w-8"></div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-300"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-gray-300 rounded w-32"></div>
                                        <div className="h-3 bg-gray-300 rounded w-24"></div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-gray-300 rounded w-20"></div>
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-gray-300 rounded w-28"></div>
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-gray-300 rounded w-16"></div>
                            </TableCell>
                            <TableCell>
                                <div className="h-4 bg-gray-300 rounded w-24"></div>
                            </TableCell>
                            <TableCell>
                                <div className="h-8 bg-gray-300 rounded w-8"></div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TableSkeleton;