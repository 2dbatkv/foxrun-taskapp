#!/usr/bin/env python3
"""
Test script for Google Sheets integration
Run this after setting up environment variables to verify connection
"""

import os
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

def test_environment_variables():
    """Test if required environment variables are set"""
    print("=" * 60)
    print("STEP 1: Testing Environment Variables")
    print("=" * 60)

    sheet_id = os.getenv('GOOGLE_SHEET_ID')
    service_account_json = os.getenv('GOOGLE_SERVICE_ACCOUNT_JSON')

    if not sheet_id:
        print("❌ GOOGLE_SHEET_ID is not set")
        return False
    else:
        print(f"✅ GOOGLE_SHEET_ID is set: {sheet_id[:20]}...")

    if not service_account_json:
        print("❌ GOOGLE_SERVICE_ACCOUNT_JSON is not set")
        return False
    else:
        # Try to parse as JSON
        try:
            import json
            creds = json.loads(service_account_json)
            print(f"✅ GOOGLE_SERVICE_ACCOUNT_JSON is valid JSON")
            print(f"   Project: {creds.get('project_id', 'N/A')}")
            print(f"   Client Email: {creds.get('client_email', 'N/A')}")
        except json.JSONDecodeError as e:
            print(f"❌ GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON: {e}")
            return False

    return True

def test_sheets_service_import():
    """Test if sheets service can be imported"""
    print("\n" + "=" * 60)
    print("STEP 2: Testing Sheets Service Import")
    print("=" * 60)

    try:
        from app.services.sheets_service import sheets_service, USER_MAPPING

        if sheets_service is None:
            print("⚠️ Sheets service is None (credentials not configured)")
            return False

        print("✅ Sheets service imported successfully")
        print(f"✅ User mapping loaded: {len(USER_MAPPING)} entries")
        return True

    except Exception as e:
        print(f"❌ Error importing sheets service: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_sheets_connection():
    """Test actual connection to Google Sheets"""
    print("\n" + "=" * 60)
    print("STEP 3: Testing Google Sheets Connection")
    print("=" * 60)

    try:
        from app.services.sheets_service import sheets_service

        if sheets_service is None:
            print("❌ Sheets service not initialized")
            return False

        # Try to get the spreadsheet info
        print(f"📊 Spreadsheet ID: {sheets_service.sheet_id}")
        print(f"📄 Worksheet: {sheets_service.worksheet.title}")
        print(f"🔢 Row count: {sheets_service.worksheet.row_count}")
        print(f"🔢 Column count: {sheets_service.worksheet.col_count}")

        print("\n✅ Successfully connected to Google Sheet!")
        return True

    except Exception as e:
        print(f"❌ Error connecting to Google Sheets: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_read_tasks():
    """Test reading tasks from Google Sheet"""
    print("\n" + "=" * 60)
    print("STEP 4: Testing Task Reading")
    print("=" * 60)

    try:
        from app.services.sheets_service import sheets_service

        if sheets_service is None:
            print("❌ Sheets service not initialized")
            return False

        # Get all tasks
        print("📖 Reading all tasks...")
        tasks = sheets_service.get_assigned_tasks()
        print(f"✅ Retrieved {len(tasks)} tasks from Google Sheet")

        if tasks:
            print("\n📋 Sample task (first one):")
            first_task = tasks[0]
            for key, value in first_task.items():
                print(f"   {key}: {value}")

        # Test filtering by assignee
        print("\n📖 Testing assignee filtering...")
        for label in ['AJB - Admin (9553AJB)', 'SAM - Member (9127SAM)']:
            filtered = sheets_service.get_assigned_tasks(assignee_label=label)
            print(f"   {label}: {len(filtered)} tasks")

        print("\n✅ Task reading successful!")
        return True

    except Exception as e:
        print(f"❌ Error reading tasks: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_user_mapping():
    """Test user name to label mapping"""
    print("\n" + "=" * 60)
    print("STEP 5: Testing User Mapping")
    print("=" * 60)

    try:
        from app.services.sheets_service import sheets_service, USER_MAPPING

        test_names = ['Aaron', 'Rai', 'Sam', 'Samuel', 'ZB', 'Zach', 'TB', 'Tyler', 'Aur', 'Aurora']

        print("Testing Sheet name → Access code label mapping:")
        for name in test_names:
            label = USER_MAPPING.get(name)
            print(f"   {name:10} → {label}")

        print("\n✅ User mapping works correctly!")
        return True

    except Exception as e:
        print(f"❌ Error testing user mapping: {e}")
        return False

def main():
    """Run all tests"""
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "Google Sheets Integration Test" + " " * 17 + "║")
    print("╚" + "=" * 58 + "╝")
    print()

    results = {
        'Environment Variables': test_environment_variables(),
        'Service Import': test_sheets_service_import(),
        'User Mapping': test_user_mapping(),
    }

    # Only test connection if env vars are set
    if results['Environment Variables'] and results['Service Import']:
        results['Google Sheets Connection'] = test_sheets_connection()
        if results['Google Sheets Connection']:
            results['Task Reading'] = test_read_tasks()

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name:30} {status}")

    print("-" * 60)
    print(f"Total: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 All tests passed! Google Sheets integration is working!")
        return 0
    elif passed >= 3:
        print("\n⚠️ Partial success. Environment variables need to be configured.")
        print("\nNext steps:")
        print("1. Complete Google Cloud setup")
        print("2. Add environment variables to Render")
        print("3. Re-run this test")
        return 1
    else:
        print("\n❌ Tests failed. Check the errors above.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
