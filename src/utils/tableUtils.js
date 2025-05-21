export const getStatusColor = (status) => {
  switch (status) {
    case "success":
      return "text-green-500";
    case "pending":
      return "text-yellow-500";
    case "rejected":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};
