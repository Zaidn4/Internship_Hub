#!/bin/bash
cd /home/zaid/projects/internship-platform/backend
php artisan tinker --no-interaction << 'TINKER'
$user = \App\Models\User::where('email', 'hr@techcorp.com')->first();
$internship = \App\Models\Internship::latest()->first();
$company = $user->company;
echo "User company id: " . $company->id . "\n";
echo "Company id type: " . gettype($company->id) . "\n";
echo "Internship company_id: " . $internship->company_id . "\n";
echo "company_id type: " . gettype($internship->company_id) . "\n";
echo "Strict ===: " . ($company->id === $internship->company_id ? 'YES' : 'NO') . "\n";
echo "Loose ==: " . ($company->id == $internship->company_id ? 'YES' : 'NO') . "\n";
TINKER
