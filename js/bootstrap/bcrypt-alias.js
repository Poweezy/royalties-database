/**
 * Bcrypt global alias for inline scripts and legacy contexts.
 * Runs as a classic script immediately after js/bcrypt.min.js, so the
 * execution order and semantics are identical to the previous inline block.
 */
window.bcrypt = window.bcrypt || (window.dcodeIO && window.dcodeIO.bcrypt);
