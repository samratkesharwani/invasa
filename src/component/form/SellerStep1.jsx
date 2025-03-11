import { Link } from 'react-router-dom';

<div className="mb-6 bg-gray-900 dark:bg-dark-1 p-4 rounded-lg">
  <h4 className="text-white text-md font-medium mb-2">Next Steps</h4>
  <p className="text-gray-300 mb-3">
    After completing this form, you'll need to set up your inventory to start selling products.
  </p>
  <Link 
    to="/inventory-setup" 
    className="text-secondary hover:text-[#0BB489] font-medium"
  >
    Set up inventory after submission →
  </Link>
</div> 