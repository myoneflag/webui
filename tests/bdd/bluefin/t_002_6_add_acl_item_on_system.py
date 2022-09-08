# coding=utf-8
"""SCALE UI feature tests."""
import time
from function import (
    wait_on_element,
    is_element_present,
    attribute_value_exist,
    wait_for_attribute_value,
    wait_on_element_disappear,
    ssh_cmd
)




def test_add_acl_item_on_system(driver):
    """test_add_acl_item_on_system"""
    if not is_element_present(driver, '//h1[contains(.,"Storage")]'):
        assert wait_on_element(driver, 10, '//mat-list-item[@ix-auto="option__Storage"]', 'clickable')
        driver.find_element_by_xpath('//mat-list-item[@ix-auto="option__Storage"]').click()
    assert wait_on_element(driver, 10, '//h1[contains(.,"Storage")]')


   # click on my_acl_dataset
    assert wait_on_element(driver, 5, '//tr[contains(.,"my_acl_dataset")]//mat-icon[text()="more_vert"]', 'clickable')
    driver.find_element_by_xpath('//tr[contains(.,"my_acl_dataset")]//mat-icon[text()="more_vert"]').click()
    assert wait_on_element(driver, 5, '//button[normalize-space(text())="View Permissions"]', 'clickable')
    driver.find_element_by_xpath('//button[normalize-space(text())="View Permissions"]').click()
    assert wait_on_element(driver, 5, '//mat-icon[normalize-space(text())="edit"]', 'clickable')
    driver.find_element_by_xpath('//mat-icon[normalize-space(text())="edit"]').click()


    # the Edit ACL page should open
    assert wait_on_element(driver, 7, '//mat-card-title[contains(text(),"ACL Editor")]')


    # click on Add ACL Item, click on select User, User input should appear, enter "{input}" and select "{user}"
    assert wait_on_element(driver, 5, '//span[contains(text(),"Add Item")]', 'clickable')
    driver.find_element_by_xpath('//span[contains(text(),"Add Item")]').click()
    assert wait_on_element(driver, 5, '//mat-select[@ix-auto="select__Who"]/div/div/span[contains(.,"User")]', 'clickable')
    driver.find_element_by_xpath('//mat-select[@ix-auto="select__Who"]/div/div/span[contains(.,"User")]').click()
    assert wait_on_element(driver, 5, '//mat-option[@ix-auto="option__Who_User"]', 'clickable')
    driver.find_element_by_xpath('//mat-option[@ix-auto="option__Who_User"]').click()
    assert wait_on_element(driver, 5, '(//div[@ix-auto="combobox__User"]//mat-form-field//input[@data-placeholder="User"])', 'inputable')
    driver.find_element_by_xpath('(//div[@ix-auto="combobox__User"]//mat-form-field//input[@data-placeholder="User"])').send_keys(input)
    time.sleep(1)
    driver.find_element_by_xpath('(//div[@ix-auto="combobox__User"]//mat-form-field//input[@data-placeholder="User"])').click()

    assert wait_on_element(driver, 5, f'//mat-option[@ix-auto="option__{user}"]', 'clickable')
    driver.find_element_by_xpath(f'//mat-option[@ix-auto="option__{user}"]').click()


    # click the Save button, return to the Pools page, click on the "my_acl_dataset" 3 dots button, select Edit Permissions
    assert wait_on_element(driver, 5, '//span[contains(text(),"Save Access Control List")]', 'clickable')
    driver.find_element_by_xpath('//span[contains(text(),"Save Access Control List")]').click()
    assert wait_on_element(driver, 10, '//h1[contains(.,"Storage")]')
    assert wait_on_element_disappear(driver, 15, '//mat-spinner[@role="progressbar"]')
    assert wait_on_element(driver, 5, '//mat-panel-title[contains(.,"system")]')
    driver.find_element_by_xpath('//tr[contains(.,"my_acl_dataset")]//mat-icon[text()="more_vert"]').click()
    assert wait_on_element(driver, 5, '//button[normalize-space(text())="View Permissions"]', 'clickable')
    driver.find_element_by_xpath('//button[normalize-space(text())="View Permissions"]').click()


    # the Edit ACL page should open, verify the new ACL item for user "{user}" exists
    assert wait_on_element(driver, 7, '//div[contains(text(),"User - ericbsd")]')