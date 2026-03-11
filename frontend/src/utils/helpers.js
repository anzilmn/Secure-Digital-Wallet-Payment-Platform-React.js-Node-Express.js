export const formatCurrency = a => '₹'+Number(a||0).toLocaleString('en-IN');
export const formatDate     = d => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
export const formatDateTime = d => new Date(d).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
export const getInitials    = n => n ? n.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2) : 'U';
