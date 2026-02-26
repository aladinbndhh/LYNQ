# Odoo 17 Compatibility Notes

## Version Update

The module has been updated from version `18.0.1.0.0` to `17.0.1.0.0` to match your Odoo 17.0 instance.

## Database Name

From the Odoo logs, the actual database name is:
```
p_aladinbndhh_lynq_test_live_29061122
```

**Note**: The database name uses **underscores** (`_`) not hyphens (`-`).

Your `.env` file has been updated with the correct database name.

## Odoo 17 vs Odoo 18 Differences

The module was originally designed for Odoo 18, but has been adapted for Odoo 17. Key differences:

### 1. Version Format
- **Odoo 18**: `18.0.x.y.z`
- **Odoo 17**: `17.0.x.y` or `17.0.x.y.z` ✅ (Updated)

### 2. View Syntax
- Odoo 17 uses `<tree>` for list views (not `<list>`)
- The module views should work with Odoo 17

### 3. Field Attributes
- Odoo 17 uses `attrs` attribute (deprecated in Odoo 18)
- The module should work with both

## Next Steps

1. **Restart Odoo** - After updating the manifest version, restart your Odoo instance
2. **Update Apps List** - Go to Apps > Update Apps List in Odoo
3. **Install Module** - Install the "LynQ Connector" module
4. **Verify Database Name** - Make sure your `.env` file has the correct database name with underscores

## Testing

After installation, test the module by:
1. Creating a LynQ profile
2. Accessing the contact page: `/lynq/contact/<username>`
3. Testing webhook endpoints

## Troubleshooting

If you still see errors:
1. Clear Odoo cache: Restart Odoo server
2. Check module logs in Odoo
3. Verify all dependencies are installed (base, crm, calendar, contacts, website)
